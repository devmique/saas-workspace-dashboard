# Workspace SaaS Dashboard

A production-grade, multi-tenant workspace management SaaS built with Next.js 15, Supabase, and TypeScript. This project demonstrates modern full-stack development patterns suitable for enterprise applications.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Database-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4)

## Overview

This is a complete SaaS application that showcases production-ready patterns including Row Level Security, Server Actions, optimistic UI updates, real-time activity tracking, and multi-tenancy. Built as a portfolio piece to demonstrate modern Next.js and Supabase expertise.

## Key Features

### Core Functionality
- **Multi-tenant Workspaces** - Users can create and join multiple workspaces
- **Project Management** - Create, update, and track projects within workspaces
- **Team Collaboration** - Invite members with role-based access (owner, admin, member)
- **Activity Feed** - Real-time audit log of all workspace activities
- **Analytics Dashboard** - Visual charts showing project distribution and activity trends

### Technical Highlights
- **Optimistic UI** - Instant feedback with React transitions and pending states
- **Row Level Security** - Database-level security policies protecting all data
- **Server Actions** - Type-safe mutations with proper revalidation
- **Theme System** - Light/dark mode with system preference detection
- **Responsive Design** - Mobile-first approach with sidebar navigation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| UI Components | shadcn/ui |
| Charts | Recharts |
| State | React Server Components + Server Actions |

## Project Structure

```
├── app/
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   └── sign-up/
│   ├── dashboard/            # Protected dashboard routes
│   │   ├── [workspaceId]/   # Dynamic workspace routes
│   │   │   ├── analytics/   # Analytics page with charts
│   │   │   ├── projects/    # Project management
│   │   │   ├── team/        # Team management
│   │   │   └── settings/    # Workspace settings
│   │   └── layout.tsx       # Dashboard layout with sidebar
│   └── layout.tsx           # Root layout with theme provider
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard-sidebar.tsx
│   ├── analytics-charts.tsx
│   └── ...
├── lib/
│   ├── actions.ts           # Server Actions
│   ├── types.ts             # TypeScript types
│   └── supabase/            # Supabase clients
│       ├── client.ts        # Client-side singleton
│       └── server.ts        # Server-side singleton
├── scripts/                 # Database migrations
│   ├── 001_create_schema.sql
│   ├── 002_seed_demo_data.sql
│   └── 003_fix_rls_policies.sql
└── middleware.ts                 # Middleware for auth
```

## Database Schema

### Core Tables

**profiles**
- Links to Supabase auth.users
- Stores display name and avatar URL

**workspaces**
- Multi-tenant workspace containers
- Stores name, description, owner

**projects**
- Belongs to workspace
- Status: planning, active, completed, archived

**workspace_members**
- Junction table for users and workspaces
- Roles: owner, admin, member

**activity_logs**
- Append-only audit trail
- Tracks all mutations with metadata

### Row Level Security

All tables use RLS policies ensuring:
- Users only see data from their workspaces
- Role-based permissions for mutations
- Secure definer functions to prevent recursion

## Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### 1. Clone and Install

```bash
git clone https://github.com/devmique/saas-workspace-dashboard
cd workspace-saas-dashboard
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Postgres (provided by Supabase)
POSTGRES_URL=your_postgres_url
```

### 3. Database Setup

Run the SQL scripts in order from the `scripts/` folder in your Supabase SQL Editor:

```sql
-- 1. Create schema and RLS policies
scripts/001_create_schema.sql

-- 2. (Optional) Seed demo data
scripts/002_seed_demo_data.sql

-- 3. Fix RLS policies
scripts/003_fix_rls_policies.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Create Your Account

1. Navigate to `/auth/sign-up`
2. Create an account
3. Confirm email (check Supabase Auth settings)
4. Login and create your first workspace

## Key Patterns & Best Practices

### Server Actions
All mutations use Server Actions with proper type safety:

```typescript
'use server'

export async function createProject(workspaceId: string, formData: FormData) {
  const supabase = await createServerClient()
  // ... validation and insertion
  revalidatePath(`/dashboard/${workspaceId}`)
}
```

### Optimistic Updates
Client components use React transitions for instant feedback:

```typescript
const [isPending, startTransition] = useTransition()
const [optimisticProjects, addOptimisticProject] = useOptimistic(projects)

startTransition(async () => {
  addOptimisticProject(newProject)
  await createProject(workspaceId, formData)
})
```

### Supabase Client Singleton
Prevents multiple client instances:

```typescript
let client: TypedSupabaseClient | undefined

export function createBrowserClient() {
  if (client) return client
  client = createClient(/* ... */)
  return client
}
```

### Middleware Auth
Token refresh and session management:

```typescript
export async function middleware(request: NextRequest) {
  const supabase = createServerClient()
  await supabase.auth.getUser() // Refreshes session
  return response
}
```

## Architecture Decisions

### Why Server Components?
- Reduced JavaScript bundle size
- Direct database access
- Better SEO and performance
- Simpler data fetching

### Why Server Actions?
- Type-safe mutations
- Automatic serialization
- Progressive enhancement
- No API route boilerplate

### Why Supabase?
- PostgreSQL with RLS
- Built-in authentication
- Real-time capabilities
- Excellent DX

### Why No State Management Library?
- Server Components reduce client state needs
- URL state for navigation
- React Context for theme
- Optimistic updates with useOptimistic

## Performance Optimizations

- Server Components for data fetching
- Parallel data fetching where possible
- Proper revalidation strategy
- Loading states with Suspense
- Optimistic UI for perceived performance

## Security Features

- Row Level Security on all tables
- Server-side validation
- Protected routes via middleware
- No exposed service keys
- CSRF protection via Server Actions
- Type-safe database queries

## Future Enhancements

- [ ] Real-time collaboration with Supabase Realtime
- [ ] File uploads with Supabase Storage
- [ ] Email notifications for invites
- [ ] Advanced project filtering and search
- [ ] Project templates
- [ ] Time tracking
- [ ] Export functionality

## License

MIT

## Contact

Built as a portfolio project demonstrating modern full-stack development with Next.js and Supabase.
