# PHASE 3: BACKEND 4-LAYER MONOLITH & USER ISOLATION

---

## 1. OBJECTIVE
Implement the pure TypeScript 4-layer backend monolith (`domain` -> `application` -> `infrastructure` -> `presentation`) with Drizzle ORM against PostgreSQL, JWT security via `APP_SECRET`, dynamic multi-origin CORS, and strict multi-user data isolation.

---

## 2. ACCEPTANCE CRITERIA (ACs)

- [ ] **AC-3.1**: **Domain Layer**:
  - Pure domain entities: `User`, `Project`, `Tag`, `Note`.
  - Repository interfaces: `IUserRepository`, `IProjectRepository`, `ITagRepository`, `INoteRepository`.
  - Domain error classes: `DomainError`, `NotFoundError`, `ConflictError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`.
- [ ] **AC-3.2**: **Application Layer**:
  - Use case orchestration services: `AuthService`, `ProjectService`, `TagService`, `NoteService`.
  - Business rules enforce user isolation by passing and asserting `userId` on all entity operations.
- [ ] **AC-3.3**: **Infrastructure Layer**:
  - Drizzle ORM schema mapping PostgreSQL tables: `usersTable`, `projectsTable`, `tagsTable`, `notesTable`, `noteTagsTable`.
  - `noteDate` mapped with `date("note_date", { mode: "string" })`.
  - `NoteRepository` queries PostgreSQL using `gte` and `lte` date ranges for month filtering.
  - `JwtService` and `BcryptPasswordHasher` implement token generation/verification with `APP_SECRET`.
- [ ] **AC-3.4**: **Presentation Layer**:
  - Express REST controllers: `AuthController`, `ProjectController`, `TagController`, `NoteController`.
  - Middlewares: `authMiddleware` (JWT verification), `validateBody`/`validateQuery` (Zod validation), `errorHandler` (maps domain errors to standard HTTP status codes).
  - Dynamic CORS: strips trailing slashes, dynamically allows all `*.vercel.app` domains, and supports comma-separated origin lists.
- [ ] **AC-3.5**: Comprehensive unit and isolation test suite verifying multi-user data isolation.

---

## 3. EXPECTATIONS

- Strict user isolation: User A cannot read, update, or delete User B's projects, tags, or notes.
- Incompatible SQL queries (e.g. `LIKE` on `DATE` columns) are strictly replaced with valid PostgreSQL range queries.
- Zero usage of `any` or `unknown` types.
- Zero comments in any implementation file.

---

## 4. VERIFICATION COMMANDS

```bash
# Run strict TypeScript compilation check on backend
pnpm --filter backend type-check

# Run backend domain, application, and multi-user isolation test suite
pnpm --filter backend test

# Build backend for production
pnpm --filter backend build

# Verify backend runtime startup
node apps/backend/dist/index.js
```

---

## 5. SKELETON OF IMPLEMENTATION

### Layer Architecture Structure
```
apps/backend/src/
├── domain/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   ├── Tag.ts
│   │   └── Note.ts
│   ├── repositories/
│   │   ├── IUserRepository.ts
│   │   ├── IProjectRepository.ts
│   │   ├── ITagRepository.ts
│   │   └── INoteRepository.ts
│   └── errors/
│       └── DomainErrors.ts
├── application/
│   ├── services/
│   │   ├── AuthService.ts
│   │   ├── ProjectService.ts
│   │   ├── TagService.ts
│   │   └── NoteService.ts
│   └── security/
│       ├── IPasswordHasher.ts
│       └── IJwtService.ts
├── infrastructure/
│   ├── database/
│   │   ├── schema.ts
│   │   └── connection.ts
│   ├── repositories/
│   │   ├── UserRepository.ts
│   │   ├── ProjectRepository.ts
│   │   ├── TagRepository.ts
│   │   └── NoteRepository.ts
│   └── security/
│       ├── PasswordHasher.ts
│       └── JwtService.ts
├── presentation/
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── ProjectController.ts
│   │   ├── TagController.ts
│   │   └── NoteController.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   ├── tag.routes.ts
│   │   ├── note.routes.ts
│   │   └── api.routes.ts
│   └── server.ts
└── index.ts
```

### Key Signatures & Repository Interfaces

#### `src/domain/repositories/INoteRepository.ts`
```ts
import { Note } from "../entities/Note";

export interface NoteFilterCriteria {
  userId: string;
  projectId?: string;
  month?: string;
  tagIds?: readonly string[];
}

export interface INoteRepository {
  findById(id: string, userId: string): Promise<Note | null>;
  findMany(criteria: NoteFilterCriteria): Promise<Note[]>;
  save(note: Note): Promise<Note>;
  update(note: Note): Promise<Note>;
  delete(id: string, userId: string): Promise<boolean>;
}
```

#### `src/infrastructure/repositories/NoteRepository.ts` (PostgreSQL Date Querying)
```ts
import { and, eq, inArray, gte, lte, SQL } from "drizzle-orm";
import { INoteRepository, NoteFilterCriteria } from "../../domain/repositories/INoteRepository";
import { Note } from "../../domain/entities/Note";
import { notesTable } from "../database/schema";

export class NoteRepository implements INoteRepository {
  public async findMany(criteria: NoteFilterCriteria): Promise<Note[]> {
    const conditions: SQL[] = [eq(notesTable.userId, criteria.userId)];

    if (criteria.projectId) {
      conditions.push(eq(notesTable.projectId, criteria.projectId));
    }

    if (criteria.month) {
      const [yearStr, monthStr] = criteria.month.split("-");
      if (yearStr && monthStr) {
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10);
        const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
        const lastDay = new Date(y, m, 0).getDate();
        const endDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
        conditions.push(gte(notesTable.noteDate, startDate));
        conditions.push(lte(notesTable.noteDate, endDate));
      }
    }
    // ...
  }
}
```

#### `src/presentation/server.ts` (Dynamic Multi-Origin CORS)
```ts
export function createServer(deps: RouteDependencies, options?: ServerOptions): Express {
  const app = express();

  const allowedOrigins = options?.corsOrigin
    ? options.corsOrigin.split(",").map((o) => o.trim().replace(/\/+$/, "")).filter((o) => o.length > 0)
    : [];

  const corsOptions: CorsOptions = {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || allowedOrigins.length === 0 || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      const normalized = requestOrigin.replace(/\/+$/, "");
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === normalized) return true;
        if (allowed.startsWith("*.") && normalized.endsWith(allowed.slice(1))) return true;
        if (normalized.includes("vercel.app") && allowed.includes("vercel.app")) return true;
        return false;
      });
      if (isAllowed) callback(null, true);
      else callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json());
  // ...
  return app;
}
```
