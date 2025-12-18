"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InviteTeamDialogProps {
  workspaceId: string
}

export function InviteTeamDialog({ workspaceId }: InviteTeamDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>Share this workspace with your team members.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Alert>
            <AlertDescription>
              Team member invitations require additional setup. Share the workspace ID with your team:
              <code className="block mt-2 p-2 bg-muted rounded text-xs break-all">{workspaceId}</code>
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="colleague@example.com" />
            <p className="text-xs text-muted-foreground">Invitation emails are a premium feature</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
