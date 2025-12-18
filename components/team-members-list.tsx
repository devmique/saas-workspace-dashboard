"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { WorkspaceMember } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface TeamMembersListProps {
  members: WorkspaceMember[]
  currentUserId: string
  userRole: string
  workspaceId: string
}

export function TeamMembersList({ members, currentUserId }: TeamMembersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>{members.length} members in this workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => {
            const profile = member.profiles
            const displayName = profile?.display_name || "Unknown User"
            const initials = displayName.slice(0, 2).toUpperCase()

            return (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {displayName}
                      {member.user_id === currentUserId && (
                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"}
                >
                  {member.role}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
