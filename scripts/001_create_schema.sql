-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Workspaces table
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Workspace members junction table
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now() not null,
  unique(workspace_id, user_id)
);

-- Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'archived', 'completed')),
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Activity log table (append-only)
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now() not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles policies
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Workspaces policies
create policy "Users can view workspaces they're members of"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = created_by);

create policy "Workspace owners/admins can update"
  on public.workspaces for update
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin')
    )
  );

-- Workspace members policies
create policy "Users can view members of their workspaces"
  on public.workspace_members for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
      and wm.user_id = auth.uid()
    )
  );

create policy "Users can insert themselves as members"
  on public.workspace_members for insert
  with check (auth.uid() = user_id);

-- Projects policies
create policy "Users can view projects in their workspaces"
  on public.projects for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can create projects"
  on public.projects for insert
  with check (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
    and auth.uid() = created_by
  );

create policy "Workspace members can update projects"
  on public.projects for update
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can delete projects"
  on public.projects for delete
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin')
    )
  );

-- Activity logs policies
create policy "Users can view activity in their workspaces"
  on public.activity_logs for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = activity_logs.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can insert activity logs"
  on public.activity_logs for insert
  with check (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = activity_logs.workspace_id
      and workspace_members.user_id = auth.uid()
    )
    and auth.uid() = user_id
  );

-- Create indexes for performance
create index idx_workspace_members_workspace on public.workspace_members(workspace_id);
create index idx_workspace_members_user on public.workspace_members(user_id);
create index idx_projects_workspace on public.projects(workspace_id);
create index idx_activity_logs_workspace on public.activity_logs(workspace_id);
create index idx_activity_logs_created on public.activity_logs(created_at desc);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
