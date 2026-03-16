import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, FolderKanban } from "lucide-react"
import type { Workspace } from "@/lib/types"

interface WorkspaceListProps {
  workspaces: Workspace[]
}

export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  if (workspaces.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-4">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No workspaces yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create your first workspace to start organizing your projects and collaborating with your team.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace) => (
        <Card key={workspace.id} className="group relative overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-xl">{workspace.name}</CardTitle>
                <CardDescription className="text-xs font-mono">{workspace.slug}</CardDescription>
              </div>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className=""
              >
                <Link href={`/dashboard/${workspace.id}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
