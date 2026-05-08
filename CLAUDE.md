# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (linting is required for commits)

### Testing
- No test framework is currently configured in this project.

### Environment
- API Gateway URL: `NEXT_PUBLIC_GATEWAY_URL` (defaults to `http://localhost:4000`)
- Revalidation secret: `NEXT_REVALIDATE_SECRET` (required for cache revalidation)

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 16.2.3 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + Shadcn UI
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: Native fetch API with custom wrapper

### Core Principles

#### Feature-Sliced Design (FSD)
The codebase follows strict feature-based architecture:
- All features are organized in `src/features/` directory
- Each feature has its own directory with subfolders for components, services, contexts, etc.
- No global "bucket" components in `src/components/` except for shared UI components

#### Rendering Strategy
- **SSR is the default**: Server components render static data and layouts
- **CSR when needed**: Client components for interactive elements (forms, buttons)
- Use `<Suspense>` for loading states instead of `useEffect`
- Avoid `"use client"` at the root level (page.tsx)

#### Authentication & API
- API calls go through the API Gateway (`NEXT_PUBLIC_GATEWAY_URL`)
- Authentication uses JWT tokens with automatic refresh
- `apiClient.ts` handles token management and refresh logic
- `refresh_token` is stored as httpOnly cookie (handled automatically)

#### Styling System
- **Dark mode**: "Cinematic Canvas" aesthetic
- **Color palette**: Crimson, Gold, Matte Black, Ivory (NO violet/purple)
- **Typography**: Manrope (headings) + Inter (body)
- **Spacing**: 8px grid with breathing room
- **Edges**: Minimal rounding (`rounded-sm`/`rounded-md`), avoid excessive glassmorphism

#### UI Components
- Built with Shadcn UI components
- Custom components follow the same design system
- Use CSS transitions for animations (no JS for simple effects)

## Key Files & Patterns

### API Layer
- `src/shared/utils/apiClient.ts` - Central API client with auth handling
- Feature-specific services in `src/features/{feature}/services/`

### Authentication
- `src/features/auth/context/AuthContext.tsx` - Global auth state
- `src/features/auth/services/authService.ts` - Auth API calls

### Layouts
- `src/app/layout.tsx` - Root layout with providers
- Feature layouts in `src/features/{feature}-layout/`

### Feature Structure
Each feature typically contains:
- `components/` - Feature-specific UI components
- `services/` - API calls and business logic
- `context/` - React contexts if needed
- `types/` - TypeScript interfaces for the feature

### Error Handling
- Consistent error handling through `apiClient.ts`
- Graceful fallbacks for failed API calls
- User-friendly error messages

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_GATEWAY_URL` - Backend API gateway URL
- `NEXT_REVALIDATE_SECRET` - Secret for cache revalidation

## Special Considerations

### API Gateway Integration
- All API requests must go through the gateway
- Backend services are not called directly from the frontend
- Authentication tokens are managed by the API client

### Next.js App Router Patterns
- Use Server Components for data fetching and layouts
- Client Components should be as small as possible
- Route groups for organizing features

### Form Patterns
- Always use React Hook Form with Zod validation
- Submit forms through API client with proper auth
- Handle loading states during form submission

### Performance
- Use Next.js caching with revalidate tags
- Implement proper loading states with Suspense
- Optimize images and static assets