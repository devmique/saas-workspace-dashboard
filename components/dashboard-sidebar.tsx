"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderKanban, BarChart3, Settings, Users, ChevronDown, Plus, Home } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateWorkspaceDialog } from "./create-workspace-dialog"
import type { User } from "@supabase/supabase-js"

interface DashboardSidebarProps {
  workspaces: Array<{
    id: string
    name: string
    slug: string
  }>
  user: User
}

export function DashboardSidebar({ workspaces, user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Extract current workspace ID from pathname
  const workspaceId = pathname.split("/dashboard/")[1]?.split("/")[0]
  const currentWorkspace = workspaces.find((w) => w.id === workspaceId)

  const isOverview = pathname === "/dashboard"

  const navigation = workspaceId
    ? [
        {
          name: "Overview",
          href: `/dashboard/${workspaceId}`,
          icon: LayoutDashboard,
          current: pathname === `/dashboard/${workspaceId}`,
        },
        {
          name: "Projects",
          href: `/dashboard/${workspaceId}/projects`,
          icon: FolderKanban,
          current: pathname.startsWith(`/dashboard/${workspaceId}/projects`),
        },
        {
          name: "Analytics",
          href: `/dashboard/${workspaceId}/analytics`,
          icon: BarChart3,
          current: pathname === `/dashboard/${workspaceId}/analytics`,
        },
        {
          name: "Team",
          href: `/dashboard/${workspaceId}/team`,
          icon: Users,
          current: pathname === `/dashboard/${workspaceId}/team`,
        },
        {
          name: "Settings",
          href: `/dashboard/${workspaceId}/settings`,
          icon: Settings,
          current: pathname === `/dashboard/${workspaceId}/settings`,
        },
      ]
    : [
        {
          name: "All Workspaces",
          href: "/dashboard",
          icon: Home,
          current: true,
        },
      ]

  return (
    <>
      <aside className="hidden w-64 flex-col border-r bg-muted/40 lg:flex">
        <div className="flex h-14 items-center border-b px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-2 font-semibold">
                <span className="truncate">{currentWorkspace?.name || "All Workspaces"}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  All Workspaces
                </Link>
              </DropdownMenuItem>
              {workspaces.map((workspace) => (
                <DropdownMenuItem key={workspace.id} asChild>
                  <Link href={`/dashboard/${workspace.id}`} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {workspace.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onSelect={() => setShowCreateDialog(true)} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 truncate text-sm">
              <p className="font-medium truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
