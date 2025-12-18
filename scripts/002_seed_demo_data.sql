-- This script creates a demo workspace and project for testing
-- Run this manually after signing up with your first user

-- Note: Replace 'YOUR_USER_ID' with the actual user ID from auth.users
-- You can get this by querying: SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Insert a demo workspace (uncomment and replace YOUR_USER_ID)
-- INSERT INTO public.workspaces (name, slug, created_by)
-- VALUES ('Demo Workspace', 'demo-workspace', 'YOUR_USER_ID');

-- Add user to workspace as owner (uncomment and replace YOUR_USER_ID and WORKSPACE_ID)
-- INSERT INTO public.workspace_members (workspace_id, user_id, role)
-- VALUES ('WORKSPACE_ID', 'YOUR_USER_ID', 'owner');

-- Create a sample project (uncomment and replace IDs)
-- INSERT INTO public.projects (workspace_id, name, description, created_by)
-- VALUES ('WORKSPACE_ID', 'Launch Campaign', 'Q1 marketing campaign', 'YOUR_USER_ID');
