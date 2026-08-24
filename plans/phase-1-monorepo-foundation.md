# PHASE 1: MONOREPO SETUP & WORKSPACE FOUNDATION

---

## 1. OBJECTIVE
Establish a unified PNPM monorepo workspace containing `apps/backend`, `apps/frontend`, and `packages/shared` with strict baseline TypeScript compiler configurations and environment contracts.

---

## 2. ACCEPTANCE CRITERIA (ACs)

- [ ] **AC-1.1**: Workspace structure defines `apps/*` and `packages/*` in `pnpm-workspace.yaml`.
- [ ] **AC-1.2**: Root `package.json` manages workspace-wide scripts (`dev`, `build`, `start`, `type-check`, `test`) and specifies `packageManager: "pnpm@10.5.2"`.
- [ ] **AC-1.3**: Base TypeScript configuration (`tsconfig.base.json`) enforces strict mode (`"strict": true`, `"noImplicitAny": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true`).
- [ ] **AC-1.4**: Single secret security environment contract is specified in `.env.example` defining `APP_SECRET`, `DATABASE_URL`, `CORS_ORIGIN`, and `VITE_API_URL`.
- [ ] **AC-1.5**: Git ignore rules properly exclude `node_modules`, build outputs (`dist/`), environment files (`.env`), and OS metadata.

---

## 3. EXPECTATIONS

- Workspace packages can reference `@taking-note/shared` using `workspace:*`.
- Running `pnpm install` resolves dependencies across all workspaces with zero hoisting conflicts.
- Zero usage of `any` or `unknown` types in all root configurations.
- Zero comments in any implementation or configuration file.

---

## 4. VERIFICATION COMMANDS

```bash
# Validate dependency installation across monorepo
pnpm install

# Validate workspace resolution
pnpm --filter @taking-note/shared exec echo "shared ready"
pnpm --filter backend exec echo "backend ready"
pnpm --filter frontend exec echo "frontend ready"

# Validate base typescript compiler options
pnpm run type-check
```

---

## 5. SKELETON OF IMPLEMENTATION

### Directory Structure
```
taking-note/
├── apps/
│   ├── backend/
│   └── frontend/
├── packages/
│   └── shared/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### Key Configurations

#### `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

#### `package.json`
```json
{
  "name": "taking-note-monorepo",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@10.5.2",
  "scripts": {
    "dev:backend": "pnpm --filter backend dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev": "pnpm --parallel --filter backend --filter frontend dev",
    "build": "pnpm --filter @taking-note/shared build && pnpm --filter backend build && pnpm --filter frontend build",
    "start": "pnpm --filter backend start",
    "type-check": "pnpm --recursive type-check",
    "test": "pnpm --filter backend test"
  }
}
```

#### `tsconfig.base.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "moduleResolution": "Node",
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

#### `.env.example`
```env
APP_SECRET=replace_with_a_secure_random_string_of_minimum_32_characters
DATABASE_URL=postgresql://postgres:password@localhost:5432/taking_note?sslmode=disable
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:4000/api
```
