"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const name = formData.get("name") as string
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name,
      slug,
      created_by: user.id,
    })
    .select()
    .single()

  if (workspaceError) throw workspaceError

  // Add creator as owner
  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  })

  if (memberError) throw memberError

  // Log activity
  await supabase.from("activity_logs").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    action: "created workspace",
    entity_type: "workspace",
    entity_id: workspace.id,
    metadata: { workspace_name: name },
  })

  revalidatePath("/dashboard")
  return { success: true, workspaceId: workspace.id }
}

export async function createProject(workspaceId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name,
      description: description || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (projectError) throw projectError

  // Log activity
  await supabase.from("activity_logs").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    action: "created project",
    entity_type: "project",
    entity_id: project.id,
    metadata: { project_name: name },
  })

  revalidatePath(`/dashboard/${workspaceId}`)
  return { success: true, project }
}

export async function updateProjectStatus(
  projectId: string,
  workspaceId: string,
  status: "active" | "archived" | "completed",
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { error } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", projectId)

  if (error) throw error

  // Log activity
  await supabase.from("activity_logs").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    action: `marked project as ${status}`,
    entity_type: "project",
    entity_id: projectId,
    metadata: { status },
  })

  revalidatePath(`/dashboard/${workspaceId}`)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

//delete workspace
export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient()

  // Get user info for logging
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Log deletion attempt
  await supabase.from("activity_logs").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    action: "deleted workspace",
    entity_type: "workspace",
    entity_id: workspaceId,
    metadata: { deleted_by: user.id },
  })

  // Delete workspace 
  const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId)
  if (error) throw error

  // Revalidate dashboard path to update UI
  revalidatePath("/dashboard")

  return { success: true }
}
