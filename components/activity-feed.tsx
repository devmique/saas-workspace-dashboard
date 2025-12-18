import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import type { ActivityLog } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ActivityFeedProps {
  activities: ActivityLog[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return <Card className="p-6 text-center text-sm text-muted-foreground">No activity yet</Card>
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const initials =
          activity.profiles?.display_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U"

        return (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm leading-relaxed">
                <span className="font-medium">{activity.profiles?.display_name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>
                {activity.metadata && (
                  <span className="font-medium">
                    {" "}
                    {(activity.metadata as { project_name?: string; workspace_name?: string }).project_name ||
                      (activity.metadata as { project_name?: string; workspace_name?: string }).workspace_name}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
