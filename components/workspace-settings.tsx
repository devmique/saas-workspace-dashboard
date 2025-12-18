"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Workspace } from "@/lib/types"

interface WorkspaceSettingsProps {
  workspace: Workspace
  userRole: string
}

export function WorkspaceSettings({ workspace, userRole }: WorkspaceSettingsProps) {
  const isOwner = userRole === "owner"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic workspace information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input id="name" defaultValue={workspace.name} disabled={!isOwner} />
            <p className="text-xs text-muted-foreground">This is the display name for your workspace</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" defaultValue={workspace.slug} disabled />
            <p className="text-xs text-muted-foreground">URL-friendly identifier (cannot be changed)</p>
          </div>
          {isOwner && <Button disabled>Save Changes</Button>}
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for this workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Deleting a workspace is permanent and cannot be undone. All projects and data will be lost.
              </AlertDescription>
            </Alert>
            <Separator />
            <Button variant="destructive" disabled>
              Delete Workspace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
