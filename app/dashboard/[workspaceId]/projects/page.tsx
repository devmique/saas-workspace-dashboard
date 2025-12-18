import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import type { Project } from "@/lib/types"
import { ProjectList } from "@/components/project-list"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ProjectsPage({
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

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*, profiles(*)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  const projectsList = (projects || []) as Project[]
  const activeProjects = projectsList.filter((p) => p.status === "active")
  const completedProjects = projectsList.filter((p) => p.status === "completed")
  const archivedProjects = projectsList.filter((p) => p.status === "archived")

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">All projects in {workspace.name}</p>
          </div>
          <CreateProjectDialog workspaceId={workspaceId} />
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({projectsList.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedProjects.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <ProjectList projects={projectsList} workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="active" className="space-y-4">
            <ProjectList projects={activeProjects} workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <ProjectList projects={completedProjects} workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="archived" className="space-y-4">
            <ProjectList projects={archivedProjects} workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
