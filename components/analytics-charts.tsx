"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { useMemo } from "react"

interface AnalyticsChartsProps {
  projects: Array<{ status: string; created_at: string }>
  activities: Array<{ created_at: string; action: string }>
}

export function AnalyticsCharts({ projects, activities }: AnalyticsChartsProps) {
  // Project status distribution


  const statusData = useMemo(() => {
    const statusCount: Record<string, number> = {}
    projects.forEach((p) => {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1
    })
    return [
      { name: "Active", value: statusCount.active || 0, fill: "hsl(var(--chart-1))" },
      { name: "Completed", value: statusCount.completed || 0, fill: "hsl(var(--chart-2))" },
      { name: "Archived", value: statusCount.archived || 0, fill: "hsl(var(--chart-3))" },
    ]
  }, [projects])

  // Activity over time (last 7 days)
  const activityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    const activityByDay: Record<string, number> = {}
    activities.forEach((a) => {
      const day = a.created_at.split("T")[0]
      activityByDay[day] = (activityByDay[day] || 0) + 1
    })

    return last7Days.map((day) => ({
      date: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
      activities: activityByDay[day] || 0,
    }))
  }, [activities])

  // Projects created over time (last 30 days)
  const projectsData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    const projectsByDay: Record<string, number> = {}
    projects.forEach((p) => {
      const day = p.created_at.split("T")[0]
      if (last30Days.includes(day)) {
        projectsByDay[day] = (projectsByDay[day] || 0) + 1
      }
    })

    return last30Days
      .filter((_, i) => i % 5 === 0) // Show every 5th day for readability
      .map((day) => ({
        date: new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        projects: projectsByDay[day] || 0,
      }))
  }, [projects])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Project Status Distribution</CardTitle>
          <CardDescription>Current status of all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              active: { label: "Active", color: "hsl(var(--chart-1))" },
              completed: { label: "Completed", color: "hsl(var(--chart-2))" },
              archived: { label: "Archived", color: "hsl(var(--chart-3))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Last 7 Days</CardTitle>
          <CardDescription>Daily activity count</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              activities: { label: "Activities", color: "hsl(var(--chart-1))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="activities" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Projects Created (Last 30 Days)</CardTitle>
          <CardDescription>Trend of project creation</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              projects: { label: "Projects", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="projects" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
