# TAKING NOTE - MASTER IMPLEMENTATION PLAN

High-density, first-principles implementation plan for the minimalist, calendar-first note management platform.

---

## 1. SYSTEM OVERVIEW & ARCHITECTURAL PRINCIPLES

Taking Note is a calendar-first note management system featuring multi-user data isolation, project categorization, dynamic multi-tag filtering, and responsive inside-cell scrolling.

### Core Constraints
- **Layered Monolith**: Unidirectional 4-layer backend architecture (`domain` -> `application` -> `infrastructure` -> `presentation`).
- **Zero Type Casting**: Zero usage of `any` or `unknown` types across all packages.
- **Zero Comments in Implementation**: Self-documenting code with zero inline or block explanatory comments.
- **Single Secret Security**: Only one master secret (`APP_SECRET`) for JWT signing and session security.
- **Multi-User Isolation**: Independent data scoping strictly by `userId`.
- **Package Management**: PNPM workspaces monorepo with dual CJS/ESM module distribution.

---

## 2. PHASE ROADMAP

| Phase | Specification Document | Focus Area |
|---|---|---|
| **Phase 1** | [`phase-1-monorepo-foundation.md`](./phase-1-monorepo-foundation.md) | PNPM Workspace Monorepo, TSConfig Base, Environment Config |
| **Phase 2** | [`phase-2-shared-dtos-and-contracts.md`](./phase-2-shared-dtos-and-contracts.md) | Shared Zod Schemas, DTOs, Constants, Dual CJS/ESM Output |
| **Phase 3** | [`phase-3-backend-domain-and-4-layer-monolith.md`](./phase-3-backend-domain-and-4-layer-monolith.md) | Domain Entities, Services, Drizzle ORM Repositories, JWT, Dynamic CORS |
| **Phase 4** | [`phase-4-frontend-calendar-and-ui.md`](./phase-4-frontend-calendar-and-ui.md) | Monday-First Calendar Grid, Inside-Cell Scrolling, Note Chips, Tag Tone Selector |
| **Phase 5** | [`phase-5-deployment-render-and-vercel.md`](./phase-5-deployment-render-and-vercel.md) | Render Web Service, Neon PostgreSQL, Vercel SPA Routing |

---

## 3. UNIFIED DATA FLOW

```mermaid
flowchart TD
    Client["Frontend (React 18 + Vite + Tailwind)"] -->|HTTP / JSON (Bearer JWT)| Presentation["Presentation Layer (Express Controllers & Middleware)"]
    Presentation -->|Validated DTOs via Zod| Application["Application Layer (Domain Services)"]
    Application -->|Entities & Value Objects| Domain["Domain Layer (Entities & Repository Interfaces)"]
    Application -->|Repository Calls| Infrastructure["Infrastructure Layer (Drizzle ORM & Postgres Repositories)"]
    Infrastructure -->|SQL Queries via pg Pool| Database[("Neon PostgreSQL Database")]
    Infrastructure -->|JWT Signing via APP_SECRET| Security["Security Services (JwtService, BcryptHasher)"]
```

---

## 4. MASTER VERIFICATION SUITE

All phases must satisfy the following master verification commands:

```bash
# 1. Monorepo dependency validation
pnpm install

# 2. Strict TypeScript type check across all workspaces
pnpm run type-check

# 3. Backend domain, application, and isolation test suite
pnpm run test

# 4. Monorepo topological production build
pnpm run build

# 5. Local server startup validation
pnpm run start
```
