# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application (runs Prisma generate first)
- `npm run lint` - Run Next.js linting
- `npm start` - Start production server

### Database Commands
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio for database management

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Stack Auth (@stackframe/stack)
- **UI Components**: Radix UI with shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **TypeScript**: Full type safety throughout

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard pages
│   ├── intro/            # Landing/authentication pages
│   └── handler/          # Stack Auth handlers
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── auth/            # Authentication components  
├── lib/                 # Utilities and services
│   └── services/        # Database service layer
└── hooks/               # Custom React hooks
```

### Database Schema
Core entities managed via Prisma:
- **User**: Linked to Stack Auth via `stackUserId`
- **Transaction**: Financial transactions with amount, type, category
- **Category**: User-specific transaction categories with colors
- **Budget**: Budget tracking with periods (weekly/monthly/quarterly/yearly)

Transaction types: `EXPENSE`, `INCOME`, `EXPENSE_SAVINGS`, `RETURN`

### Authentication Flow
1. Stack Auth handles authentication via `/intro` and `/handler` routes
2. Root page (`/`) redirects based on auth status
3. Database user initialization happens automatically via `initializeUserData()`
4. Default categories are created for new users

### API Architecture
- API routes in `/api/` follow REST conventions
- All routes require Stack Auth authentication
- Database operations abstracted through service layer (`/lib/services/database.ts`)
- Zod schemas validate request payloads
- Automatic user initialization on first API call

### Key Patterns
- **Server/Client Split**: `stack.tsx` (server) and `stack.client.ts` (client)
- **Service Layer**: Database operations centralized in `/lib/services/`
- **Type Safety**: Zod validation for API inputs, Prisma types for database
- **Authentication**: Stack Auth integration with automatic user creation
- **UI Components**: shadcn/ui pattern with Radix UI primitives

### Configuration
- Database connection via `DATABASE_URL` environment variable
- TypeScript path alias `@/*` maps to `src/*`
- Prisma client configured with development query logging
- Stack Auth uses Next.js cookie token store

## Important Notes
- Always run `npm run db:generate` after schema changes
- New users automatically get default categories via `initializeUserData()`
- All API routes require authentication and handle user initialization
- Database operations should go through the service layer, not direct Prisma calls
- UI follows dark theme with glassmorphism effects and animations