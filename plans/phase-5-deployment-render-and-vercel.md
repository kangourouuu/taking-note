# PHASE 5: CLOUD DEPLOYMENT & PRODUCTION PLATFORMS

---

## 1. OBJECTIVE
Deploy the Taking Note platform to production using **Render** for the Express backend, **Neon** for managed PostgreSQL, and **Vercel** for the React Vite SPA frontend with seamless environment configuration and dynamic CORS.

---

## 2. ACCEPTANCE CRITERIA (ACs)

- [ ] **AC-5.1**: **Render Backend Web Service**:
  - Blueprint configured in `render.yaml` defining Node web service, auto-generation for `APP_SECRET`, sync for `DATABASE_URL` and `CORS_ORIGIN`.
  - Production build command: `pnpm --filter @taking-note/shared build && pnpm --filter backend build`.
  - Start command: `node apps/backend/dist/index.js` running without `ERR_REQUIRE_ESM`.
- [ ] **AC-5.2**: **Neon PostgreSQL Integration**:
  - Direct connection string with `sslmode=require` configured on Render backend.
  - Automatic table creation via migrations or initial startup.
- [ ] **AC-5.3**: **Vercel Frontend SPA Routing**:
  - Configured in `apps/frontend/vercel.json` and root `vercel.json` with `framework: "vite"`, `outputDirectory: "dist"`, and SPA client rewrites (`/(.*) -> /index.html`).
  - Standalone build enabled via TypeScript path mappings in `apps/frontend/tsconfig.json` and Vite alias in `apps/frontend/vite.config.ts`.
- [ ] **AC-5.4**: **Dynamic URL Normalization & CORS**:
  - Frontend `getApiBaseUrl()` normalizes `VITE_API_URL` by automatically handling trailing slashes and ensuring `/api` subpath targeting.
  - Backend dynamically validates all `*.vercel.app` subdomains and comma-separated origin lists.

---

## 3. EXPECTATIONS

- Deploying to Vercel with Root Directory set to `apps/frontend` builds cleanly in < 10 seconds.
- Node 22+ on Render starts the compiled CommonJS backend seamlessly without ESM requirement errors.
- Preflight CORS requests from Vercel preview and production domains pass access control verification.

---

## 4. VERIFICATION COMMANDS

```bash
# 1. Verify topological full build
pnpm build

# 2. Verify backend runtime execution
node apps/backend/dist/index.js

# 3. Verify frontend standalone build from apps/frontend
cd apps/frontend && tsc && vite build
```

---

## 5. SKELETON OF IMPLEMENTATION

### Key Configuration Files

#### `render.yaml`
```yaml
services:
  - type: web
    name: taking-note-backend
    runtime: node
    plan: free
    buildCommand: pnpm --filter @taking-note/shared build && pnpm --filter backend build
    startCommand: node apps/backend/dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: APP_SECRET
        generateValue: true
      - key: DATABASE_URL
        sync: false
      - key: CORS_ORIGIN
        sync: false
```

#### `apps/frontend/vercel.json`
```json
{
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### `apps/frontend/src/api/client.ts` (Dynamic URL Normalizer)
```ts
function getApiBaseUrl(): string {
  const envUrl = import.meta.env["VITE_API_URL"];
  if (!envUrl || typeof envUrl !== "string") {
    return "/api";
  }
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
  return trimmed;
}

const API_BASE_URL = getApiBaseUrl();
```

---

## 6. PRODUCTION ENVIRONMENT MAPPING

| Platform | Variable | Example Value | Description |
|---|---|---|---|
| **Vercel** | `VITE_API_URL` | `https://taking-note-backend.onrender.com/api` | Live backend API URL on Render |
| **Render** | `APP_SECRET` | *(Auto-generated $\ge$ 32 chars)* | Master secret for JWT security |
| **Render** | `DATABASE_URL` | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` | Neon PostgreSQL instance |
| **Render** | `CORS_ORIGIN` | `https://taking-note-frontend.vercel.app` | Allowed Vercel domain(s) |
```
