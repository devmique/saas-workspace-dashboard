-- Drop the existing workspace insert policy
drop policy if exists "Users can create workspaces" on public.workspaces;

-- Create a new policy that allows authenticated users to create workspaces
-- The created_by field will be automatically set to the current user
create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Also ensure the workspace_members insert policy allows owners to be added
drop policy if exists "Users can insert themselves as members" on public.workspace_members;

create policy "Users can insert themselves as workspace members"
  on public.workspace_members for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow admins/owners to add other members
create policy "Admins can add members to their workspaces"
  on public.workspace_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  );
