# TAKING NOTE - SYSTEM ARCHITECTURE & DEVELOPER CONVENTIONS

Minimalist, calendar-first note management system with project categorization, multi-tag filtering, and strict user-isolated storage.

---

## 1. CORE PHILOSOPHY & CONSTRAINTS

- **First Principles & Zero Fluff**: Clean, direct, minimal abstractions. Everything has a concrete operational purpose.
- **Strict Layered Monolith**: Strict separation across 4 unidirectional layers: `domain` -> `application` -> `infrastructure` -> `presentation`.
- **Zero Type Casting**: Zero usage of `any` or `unknown` types anywhere in the codebase. All contracts are explicitly typed with compile-time verification.
- **Zero Comments in Implementation**: Code must be clean and self-documenting. No inline, block, or trailing explanatory comments in source implementation files.
- **Data Transfer Objects (DTOs)**: All boundary crossing between layers and client/server boundaries must use strongly typed DTOs validated via schema validation.
- **Single Secret Security**: Only one master secret (`APP_SECRET`) stored in `.env` for JWT signing, token validation, and session security.
- **User Isolation**: Independent multi-user architecture (2+ users) scoped strictly by `userId`. No RBAC or ABAC complexity.
- **Package Management**: Managed strictly via `pnpm` workspaces.

---

## 2. TECH STACK & DEPLOYMENT TARGETS

| Component | Technology | Deployment Platform |
|---|---|---|
| Frontend | React 18+, Vite, Tailwind CSS, Lucide Icons | Vercel |
| Backend | Node.js, Pure TypeScript, Express | Render |
| Database | PostgreSQL with Drizzle ORM | Neon |
| Package Manager | `pnpm` (Monorepo Workspaces) | - |
| Fonts | Be Vietnamese Pro | Google Fonts / Self-hosted |

---

## 3. MONOREPO STRUCTURE

```
taking-note/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/
│   │   │   │   └── errors/
│   │   │   ├── application/
│   │   │   │   ├── dtos/
│   │   │   │   └── services/
│   │   │   ├── infrastructure/
│   │   │   │   ├── database/
│   │   │   │   ├── repositories/
│   │   │   │   └── security/
│   │   │   ├── presentation/
│   │   │   │   ├── controllers/
│   │   │   │   ├── middlewares/
│   │   │   │   ├── routes/
│   │   │   │   └── server.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   │   ├── auth/
│       │   │   ├── calendar/
│       │   │   ├── layout/
│       │   │   ├── notes/
│       │   │   ├── projects/
│       │   │   └── tags/
│       │   ├── context/
│       │   ├── types/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── index.html
│       ├── tailwind.config.js
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── constants/
│       │   ├── dtos/
│       │   └── types/
│       ├── tsconfig.json
│       └── package.json
├── .env.example
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

---

## 4. LAYER RESPONSIBILITIES & BOUNDARIES

1. **Domain Layer (`apps/backend/src/domain`)**
   - Contains Enterprise Business Entities (`User`, `Project`, `Tag`, `Note`) and Value Objects.
   - Defines pure interfaces for Repositories (`IUserRepository`, `IProjectRepository`, `ITagRepository`, `INoteRepository`).
   - Pure TypeScript without external framework dependencies.
2. **Application Layer (`apps/backend/src/application`)**
   - Orchestrates use cases and domain entities.
   - Enforces business rules and transforms raw inputs to/from DTOs.
   - Zero awareness of HTTP requests/responses or specific database drivers.
3. **Infrastructure Layer (`apps/backend/src/infrastructure`)**
   - Implements repository interfaces using Drizzle ORM against PostgreSQL.
   - Manages database migrations, connection pooling, and external crypto/JWT token services using `APP_SECRET`.
4. **Presentation Layer (`apps/backend/src/presentation`)**
   - Express HTTP controllers, route definitions, and auth middleware.
   - Validates incoming payloads against shared Zod DTO schemas and maps domain errors to standard HTTP response codes.

---

## 5. DATA SCHEMA & RELATIONSHIPS

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7) NOT NULL DEFAULT '#000000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(500),
    content TEXT NOT NULL,
    note_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

---

## 6. DESIGN TOKENS & UI SPECIFICATIONS

### Palette & Typography
- **Primary Color**: `#000000` (Pure Black) and `#FFFFFF` (Pure White).
- **Neutral Grayscale**: `#09090B`, `#18181B`, `#27272A`, `#71717A`, `#E4E4E7`, `#F4F4F5`.
- **Typography**: `Be Vietnamese Pro`, sans-serif.
- **Tag Colors**: Dynamic hex codes with curated tone selector and native hex picker.

### Calendar Rules
- **Monthly View**: Real-time month calendar grid with 5-to-6 week rows.
- **Week Order**: **Monday** is strictly the first column (`MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, `SUN`).
- **Cell Behavior**: Clicking any date cell opens the note creation modal for that date.
- **Note Chips**: Display note title or subtitle summary with associated tag color badges.
- **Filter Stability**: Filtering by project or tag toggles chip visibility without triggering calendar grid reflow or resizing.

### Dropdown Creation Triggers
- **Project Selector**: Dropdown listing user projects with `[+ Create New Project...]` anchored at the bottom.
- **Tag Selector**: Dropdown with multi-select tag checkboxes and `[+ Create New Tag...]` anchored at the bottom.

---

## 7. API CONTRACTS

| Method | Route | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user account | No |
| POST | `/api/auth/login` | Login with username and password, return JWT | No |
| GET | `/api/auth/me` | Return authenticated user profile | Yes |
| GET | `/api/projects` | List all projects belonging to user | Yes |
| POST | `/api/projects` | Create a new project | Yes |
| PUT | `/api/projects/:id` | Update existing project | Yes |
| DELETE | `/api/projects/:id` | Delete project and cascaded records | Yes |
| GET | `/api/tags` | List all tags belonging to user (optional `projectId` query) | Yes |
| POST | `/api/tags` | Create a new tag with title & hex color | Yes |
| PUT | `/api/tags/:id` | Update tag details | Yes |
| DELETE | `/api/tags/:id` | Delete tag | Yes |
| GET | `/api/notes` | List notes filtered by `projectId`, `month` (YYYY-MM), and `tagIds` | Yes |
| GET | `/api/notes/:id` | Retrieve single note by ID | Yes |
| POST | `/api/notes` | Create a note for a given date | Yes |
| PUT | `/api/notes/:id` | Update note title, summary, content, tags | Yes |
| DELETE | `/api/notes/:id` | Delete note | Yes |

---

## 8. ENVIRONMENT & SECRET SPECIFICATION

`.env` contains:
```env
APP_SECRET=replace_with_a_secure_random_string_of_minimum_32_characters
DATABASE_URL=postgresql://postgres:password@localhost:5432/taking_note?sslmode=disable
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:4000/api
```

---

## 9. BUILD, TEST & VERIFICATION COMMANDS

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm run db:migrate

# Start backend development server
pnpm --filter backend dev

# Start frontend development server
pnpm --filter frontend dev

# Run strict TypeScript verification across monorepo
pnpm run type-check

# Run backend unit and layer tests
pnpm --filter backend test

# Build production bundles
pnpm run build
```
