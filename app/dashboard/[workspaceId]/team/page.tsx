import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { TeamMembersList } from "@/components/team-members-list"
import { InviteTeamDialog } from "@/components/invite-team-dialog"
import type { WorkspaceMember } from "@/lib/types"

export default async function TeamPage({
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

  // Verify access
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

  // Fetch all team members
  const { data: members } = await supabase
    .from("workspace_members")
    .select("*, profiles(*)")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: false })

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground mt-1">Manage members of {workspace.name}</p>
          </div>
          {(userRole === "owner" || userRole === "admin") && <InviteTeamDialog workspaceId={workspaceId} />}
        </div>

        <TeamMembersList
          members={(members || []) as WorkspaceMember[]}
          currentUserId={user.id}
          userRole={userRole}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  )
}
