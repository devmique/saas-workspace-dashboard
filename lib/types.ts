export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: "owner" | "admin" | "member"
  joined_at: string
  profiles?: Profile
}

export interface Project {
  id: string
  workspace_id: string
  name: string
  description: string | null
  status: "active" | "archived" | "completed"
  created_by: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface ActivityLog {
  id: string
  workspace_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  profiles?: Profile
}
