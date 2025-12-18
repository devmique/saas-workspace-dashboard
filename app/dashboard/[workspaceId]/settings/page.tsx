import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { WorkspaceSettings } from "@/components/workspace-settings"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify access and role
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("*, workspaces(*)")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    notFound()
  }

  const workspace = membership.workspaces
  const userRole = membership.role

  // Only owners and admins can access settings
  if (userRole !== "owner" && userRole !== "admin") {
    redirect(`/dashboard/${workspaceId}`)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage workspace settings and preferences</p>
        </div>

        <WorkspaceSettings workspace={workspace} userRole={userRole} />
      </div>
    </div>
  )
}
