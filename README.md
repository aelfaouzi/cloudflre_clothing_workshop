# Clothing Workshop Manager

A production-ready Mini-SaaS for small clothing workshops. Manages fabrics inventory, tailor assignments, production job workflow, and a Kanban dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Cloudflare Workers + Hono.js |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle ORM |
| Validation | Zod |
| Cache | Cloudflare KV |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack Query |
| Auth | Clerk |

## Workflow

```
DRAFT → CUTTING → SEWING → READY → DISPATCHED
  ↓         ↓         ↓       ↓
CANCELED  CANCELED  CANCELED CANCELED
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler`)
- A [Cloudflare account](https://cloudflare.com)
- A [Clerk account](https://clerk.com)

---

### 1. Clone & install dependencies

```bash
# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

---

### 2. Set up Clerk

1. Create a new application at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Choose **Email + Password** sign-in
3. Copy your keys from the Clerk dashboard

---

### 3. Set up Cloudflare D1 Database

```bash
cd backend

# Create the D1 database
wrangler d1 create app_db

# Copy the database_id from the output and paste it in wrangler.toml:
# database_id = "YOUR_DATABASE_ID_HERE"
```

---

### 4. Set up Cloudflare KV Namespace

```bash
wrangler kv:namespace create CACHE

# Copy the id from the output and paste it in wrangler.toml:
# id = "YOUR_KV_NAMESPACE_ID_HERE"
```

---

### 5. Configure backend environment

```bash
cd backend

# Copy the example vars file
cp .dev.vars.example .dev.vars

# Edit .dev.vars and fill in your Clerk secret key:
# CLERK_SECRET_KEY=sk_test_...
```

---

### 6. Run database migrations (local)

```bash
cd backend
npm run db:migrate:local
```

---

### 7. Configure frontend environment

```bash
cd frontend

# Copy the example env file
cp .env.example .env.local

# Edit .env.local:
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# VITE_API_URL=http://localhost:8787
```

---

### 8. Start development servers

Run both in separate terminals:

```bash
# Terminal 1 — Backend (Cloudflare Worker)
cd backend
npm run dev
# → http://localhost:8787

# Terminal 2 — Frontend (Vite)
cd frontend
npm run dev
# → http://localhost:5173
```

---

## API Reference

All routes require `Authorization: Bearer <clerk_token>` header.

### Fabrics
| Method | Path | Description |
|---|---|---|
| GET | `/api/fabrics` | List all fabrics |
| GET | `/api/fabrics/low-stock` | Fabrics below threshold |
| GET | `/api/fabrics/:id` | Get fabric by ID |
| POST | `/api/fabrics` | Create fabric |
| PATCH | `/api/fabrics/:id` | Update fabric |
| DELETE | `/api/fabrics/:id` | Delete fabric |

### Tailors
| Method | Path | Description |
|---|---|---|
| GET | `/api/tailors` | List all tailors |
| GET | `/api/tailors/active` | Active tailors only |
| POST | `/api/tailors` | Create tailor |
| PATCH | `/api/tailors/:id` | Update tailor |
| DELETE | `/api/tailors/:id` | Delete tailor |

### Jobs
| Method | Path | Description |
|---|---|---|
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/:id` | Get job with relations |
| POST | `/api/jobs` | Create job |
| PATCH | `/api/jobs/:id` | Update job (DRAFT only) |
| POST | `/api/jobs/:id/transition` | Advance job status |
| DELETE | `/api/jobs/:id` | Delete job (DRAFT/CANCELED only) |

#### Transition Payload
```json
{
  "targetStatus": "CUTTING",
  "metersUsed": [
    { "fabricId": "uuid", "metersUsed": 2.5, "metersWasted": 0.2 }
  ],
  "piecesCompleted": 10
}
```

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard` | Full dashboard data |

---

## State Transition Rules

| Transition | Validation | Action |
|---|---|---|
| DRAFT → CUTTING | Tailor assigned, fabrics set, sufficient stock | Reserve fabric qty |
| CUTTING → SEWING | — | Deduct actual fabric used, record wastage |
| SEWING → READY | — | Set completedAt timestamp |
| READY → DISPATCHED | — | Decrement tailor job count |
| ANY → CANCELED | Cannot cancel DISPATCHED | Release reserved fabric |

**Inventory formula:** `available_qty = current_qty - reserved_qty`

---

## Deployment

### Deploy Backend to Cloudflare Workers

```bash
cd backend

# Set production secrets
wrangler secret put CLERK_SECRET_KEY
# Enter: sk_live_...

# Run migrations on remote D1
npm run db:migrate:remote

# Deploy the Worker
npm run deploy
```

After deploying, copy your Worker URL (e.g. `https://clothing-workshop-api.yourname.workers.dev`).

---

### Deploy Frontend

Update `frontend/.env.production`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://clothing-workshop-api.yourname.workers.dev
```

Then build and deploy (Cloudflare Pages recommended):

```bash
cd frontend
npm run build
# dist/ folder is ready to deploy

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=clothing-workshop-ui
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

---

### Production Checklist

- [ ] Replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `wrangler.toml`
- [ ] Replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` in `wrangler.toml`
- [ ] Set `CLERK_SECRET_KEY` via `wrangler secret put`
- [ ] Set `CORS_ORIGIN` in `wrangler.toml` to your frontend domain
- [ ] Run `npm run db:migrate:remote` to apply migrations to production D1
- [ ] Update `VITE_API_URL` in frontend env to production Worker URL
- [ ] Use `pk_live_...` and `sk_live_...` Clerk keys for production

---

## Project Structure

```
├── backend/
│   ├── migrations/          # SQL migration files
│   ├── src/
│   │   ├── db/              # Drizzle schema + client
│   │   ├── middleware/      # Auth, CORS, error handler
│   │   ├── repositories/    # DB access layer
│   │   ├── routes/          # Hono route handlers
│   │   ├── services/        # Business logic
│   │   │   └── transition.service.ts  # State machine
│   │   ├── types/           # Shared TypeScript types
│   │   ├── validators/      # Zod schemas
│   │   └── utils/           # Errors, response helpers
│   └── wrangler.toml
│
└── frontend/
    └── src/
        ├── components/
        │   ├── ui/          # shadcn/ui base components
        │   ├── layout/      # Sidebar + Layout
        │   ├── jobs/        # KanbanBoard, JobCard, JobForm
        │   ├── fabrics/     # FabricForm
        │   └── tailors/     # TailorForm
        ├── hooks/           # React Query hooks
        ├── lib/             # API client, query client, utils
        ├── pages/           # Dashboard, Jobs, Fabrics, Tailors, Settings
        └── types/           # Shared TypeScript types
```
