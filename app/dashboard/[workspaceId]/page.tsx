import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import type { Project, ActivityLog } from "@/lib/types"
import { ProjectList } from "@/components/project-list"
import { ActivityFeed } from "@/components/activity-feed"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, CheckCircle2, Archive, TrendingUp } from "lucide-react"

export default async function WorkspacePage({
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

  // Verify user has access to workspace
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

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*, profiles(*)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  // Fetch activity logs
  const { data: activities } = await supabase
    .from("activity_logs")
    .select("*, profiles(*)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(20)

  const projectsList = (projects || []) as Project[]
  const activeProjects = projectsList.filter((p) => p.status === "active").length
  const completedProjects = projectsList.filter((p) => p.status === "completed").length
  const archivedProjects = projectsList.filter((p) => p.status === "archived").length
  const totalProjects = projectsList.length

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all statuses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{archivedProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">No longer active</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
                <p className="text-sm text-muted-foreground mt-1">Active projects in {workspace.name}</p>
              </div>
              <CreateProjectDialog workspaceId={workspaceId} />
            </div>
            <ProjectList projects={projectsList} workspaceId={workspaceId} />
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Activity Feed</h2>
              <p className="text-sm text-muted-foreground mt-1">Recent updates</p>
            </div>
            <ActivityFeed activities={(activities || []) as ActivityLog[]} />
          </div>
        </div>
      </div>
    </div>
  )
}
