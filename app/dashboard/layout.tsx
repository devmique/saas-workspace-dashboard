import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's workspaces for sidebar
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("*, workspaces(*)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  const workspaces = (memberships?.map((m) => m.workspaces) || []).filter(Boolean)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar workspaces={workspaces} user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
