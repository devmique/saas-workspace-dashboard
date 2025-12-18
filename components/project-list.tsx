"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Circle, CheckCircle2, Archive } from "lucide-react"
import type { Project } from "@/lib/types"
import { updateProjectStatus } from "@/lib/actions"
import { useTransition } from "react"
import { formatDistanceToNow } from "date-fns"

interface ProjectListProps {
  projects: Project[]
  workspaceId: string
}

const statusConfig = {
  active: {
    label: "Active",
    variant: "default" as const,
    icon: Circle,
  },
  completed: {
    label: "Completed",
    variant: "secondary" as const,
    icon: CheckCircle2,
  },
  archived: {
    label: "Archived",
    variant: "outline" as const,
    icon: Archive,
  },
}

export function ProjectList({ projects, workspaceId }: ProjectListProps) {
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (projectId: string, status: "active" | "archived" | "completed") => {
    startTransition(async () => {
      await updateProjectStatus(projectId, workspaceId, status)
    })
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-4">
            <Circle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create your first project to get started with task management.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const StatusIcon = statusConfig[project.status].icon
        return (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <Badge variant={statusConfig[project.status].variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig[project.status].label}
                    </Badge>
                  </div>
                  {project.description && <CardDescription>{project.description}</CardDescription>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isPending} className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(project.id, "active")}
                      disabled={project.status === "active"}
                    >
                      Mark as Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(project.id, "completed")}
                      disabled={project.status === "completed"}
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(project.id, "archived")}
                      disabled={project.status === "archived"}
                    >
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
                {project.profiles && (
                  <>
                    <span>•</span>
                    <span>by {project.profiles.display_name}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
