import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <span className="text-2xl font-bold">W</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome to WorkspaceOS</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          A modern workspace management platform built with Next.js, Supabase, and production-ready patterns.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
