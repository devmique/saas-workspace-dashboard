import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AnalyticsCharts } from "@/components/analytics-charts"

export default async function AnalyticsPage({
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

  // Fetch analytics data
  const { data: projects } = await supabase
    .from("projects")
    .select("status, created_at")
    .eq("workspace_id", workspaceId)

  const { data: activities } = await supabase
    .from("activity_logs")
    .select("created_at, action")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Insights and metrics for {workspace.name}</p>
        </div>

        <AnalyticsCharts projects={projects || []} activities={activities || []} />
      </div>
    </div>
  )
}
