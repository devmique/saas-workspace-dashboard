-- Drop the problematic workspace_members SELECT policy
drop policy if exists "Users can view members of their workspaces" on public.workspace_members;

-- Create a simpler policy that avoids recursion by directly checking user_id
create policy "Users can view members of their workspaces"
  on public.workspace_members for select
  using (
    -- User can see workspace members if they are a member of that workspace
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

-- Alternative: Even simpler approach using a direct join
drop policy if exists "Users can view members of their workspaces" on public.workspace_members;

-- Use security definer function to break recursion
create or replace function public.user_is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
    and user_id = auth.uid()
  );
$$;

-- Now use the function in policies to avoid recursion
create policy "Users can view members of their workspaces"
  on public.workspace_members for select
  using (user_is_workspace_member(workspace_id));

-- Also update other policies to use the function for consistency and performance
drop policy if exists "Users can view projects in their workspaces" on public.projects;
create policy "Users can view projects in their workspaces"
  on public.projects for select
  using (user_is_workspace_member(workspace_id));

drop policy if exists "Workspace members can create projects" on public.projects;
create policy "Workspace members can create projects"
  on public.projects for insert
  with check (
    user_is_workspace_member(workspace_id)
    and auth.uid() = created_by
  );

drop policy if exists "Workspace members can update projects" on public.projects;
create policy "Workspace members can update projects"
  on public.projects for update
  using (user_is_workspace_member(workspace_id));

drop policy if exists "Workspace members can delete projects" on public.projects;
create policy "Workspace members can delete projects"
  on public.projects for delete
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = projects.workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

drop policy if exists "Users can view activity in their workspaces" on public.activity_logs;
create policy "Users can view activity in their workspaces"
  on public.activity_logs for select
  using (user_is_workspace_member(workspace_id));

drop policy if exists "Users can insert activity logs" on public.activity_logs;
create policy "Users can insert activity logs"
  on public.activity_logs for insert
  with check (
    user_is_workspace_member(workspace_id)
    and auth.uid() = user_id
  );
