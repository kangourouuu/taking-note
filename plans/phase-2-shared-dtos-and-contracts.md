# PHASE 2: SHARED DTOS, ZOD SCHEMAS & CONTRACTS

---

## 1. OBJECTIVE
Define shared TypeScript interfaces, Zod runtime validation schemas, domain constants, and dual CommonJS/ESM compilation outputs for seamless cross-package imports in both Node.js (backend) and Vite/Rollup (frontend).

---

## 2. ACCEPTANCE CRITERIA (ACs)

- [ ] **AC-2.1**: Zod validation schemas defined for Auth (`RegisterRequestSchema`, `LoginRequestSchema`), Projects (`CreateProjectSchema`, `UpdateProjectSchema`), Tags (`CreateTagSchema`, `UpdateTagSchema`), and Notes (`CreateNoteSchema`, `UpdateNoteSchema`, `NoteFilterQuerySchema`).
- [ ] **AC-2.2**: TypeScript DTO interfaces inferred from or mapped to Zod schemas with zero `any` or `unknown` types.
- [ ] **AC-2.3**: System constants defined: `HTTP_STATUS`, `DAYS_OF_WEEK` (Monday-first order), `DEFAULT_TAG_COLORS` (11 curated hex colors), and `AUTH_TOKEN_EXPIRY`.
- [ ] **AC-2.4**: Dual module compilation: `tsconfig.cjs.json` produces `dist/cjs` and `tsconfig.esm.json` produces `dist/esm` with conditional exports in `package.json`.
- [ ] **AC-2.5**: Shared module compiles with zero TypeScript errors and zero comments in source implementation files.

---

## 3. EXPECTATIONS

- Backend can synchronously `require("@taking-note/shared")` without `ERR_REQUIRE_ESM`.
- Frontend (Vite/Rollup) can statically import named exports (`import { DAYS_OF_WEEK } from "@taking-note/shared"`) with full tree-shaking support.
- Validation failures at boundaries return structured error schemas.

---

## 4. VERIFICATION COMMANDS

```bash
# Build dual CJS and ESM outputs
pnpm --filter @taking-note/shared build

# Verify presence of both dist targets
test -d packages/shared/dist/cjs && test -d packages/shared/dist/esm

# Run type check on shared package
pnpm --filter @taking-note/shared type-check
```

---

## 5. SKELETON OF IMPLEMENTATION

### Directory Structure
```
packages/shared/
├── src/
│   ├── constants/
│   │   └── index.ts
│   ├── dtos/
│   │   ├── auth.dto.ts
│   │   ├── project.dto.ts
│   │   ├── tag.dto.ts
│   │   └── note.dto.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── tsconfig.cjs.json
├── tsconfig.esm.json
├── tsconfig.json
└── package.json
```

### Key Signatures & Contracts

#### `src/constants/index.ts`
```ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const DEFAULT_TAG_COLORS = [
  "#000000", "#EF4444", "#F97316", "#F59E0B", "#10B981",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#64748B"
] as const;

export const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export const AUTH_TOKEN_EXPIRY = "7d";
```

#### `src/dtos/auth.dto.ts`
```ts
import { z } from "zod";

export const RegisterRequestSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(100)
});
export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    username: string;
    createdAt: string;
  };
}
```

#### `src/dtos/note.dto.ts`
```ts
import { z } from "zod";
import { TagResponseDto } from "./tag.dto";

export const CreateNoteSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  summary: z.string().max(500).optional(),
  content: z.string().min(1),
  noteDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tagIds: z.array(z.string().uuid()).optional().default([])
});
export type CreateNoteDto = z.infer<typeof CreateNoteSchema>;

export const UpdateNoteSchema = z.object({
  projectId: z.string().uuid().optional(),
  title: z.string().min(1).max(255).optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1).optional(),
  noteDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tagIds: z.array(z.string().uuid()).optional()
});
export type UpdateNoteDto = z.infer<typeof UpdateNoteSchema>;

export interface NoteResponseDto {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  summary: string | null;
  content: string;
  noteDate: string;
  tags: TagResponseDto[];
  createdAt: string;
  updatedAt: string;
}
```

#### `package.json` (Dual Exports)
```json
{
  "name": "@taking-note/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/esm/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/esm/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "default": "./dist/cjs/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.cjs.json && tsc -p tsconfig.esm.json",
    "type-check": "tsc --noEmit"
  }
}
```
