# Context

## User story

As a developer, I want to protect this project without leaking secret, security tokens, and other sensitive information. I want to build the project as monolith architecture with layered architecture.

## Tech stacks

- Backend: Pure typescript
- Frontend: React with vite
- Database: Postgres
- Deployment: Vercel (frontend), Render (backend), Neon (database - postgres)
- Package manager: pnpm

## ACs

- The project must have 2 users independently
- The project won't have RBAC or ABAC
- The project must be built as monolith architecture
- The project must follow layered architecture
- The project must be built as 4 layers: domain, application, infrastructure, presentation
- The project will be deployed with vercel (frontend), render (backend), neon (database - postgres)
- The project won't use any / unknown casting type
- The project must use DTO for transferring data between layers
- The project must use pnpm for package management
- The project must follow SOLID, YAGNI principles
- Move the constant to be reused

## Secret Management

- The project must use one secret
- The project must use .env file to store secrets

