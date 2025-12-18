import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Workspace } from "@/lib/types"
import { WorkspaceList } from "@/components/workspace-list"
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's workspaces
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("*, workspaces(*)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  const workspaces = (memberships?.map((m) => m.workspaces) || []).filter(Boolean) as Workspace[]

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
            <p className="mt-1 text-muted-foreground">Manage your workspaces and projects</p>
          </div>
          <CreateWorkspaceDialog />
        </div>
        <WorkspaceList workspaces={workspaces} />
      </div>
    </div>
  )
}
