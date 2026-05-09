-- Migration: 0001_initial_schema
-- Creates all core tables for the clothing workshop MVP

CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_audience TEXT,
  size_config_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tailors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  pay_rate_per_piece REAL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  assigned_jobs_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fabrics (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  fabric_code TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT,
  supplier TEXT,
  initial_qty REAL NOT NULL DEFAULT 0,
  current_qty REAL NOT NULL DEFAULT 0,
  reserved_qty REAL NOT NULL DEFAULT 0,
  cost_per_meter REAL DEFAULT 0,
  is_client_owned INTEGER DEFAULT 0,
  client_id TEXT,
  low_stock_threshold REAL DEFAULT 5,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS job_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  job_number TEXT NOT NULL,
  design_id TEXT REFERENCES designs(id),
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','CUTTING','SEWING','READY','DISPATCHED','CANCELED')),
  tailor_id TEXT REFERENCES tailors(id),
  priority TEXT DEFAULT 'NORMAL'
    CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  pieces_expected INTEGER DEFAULT 0,
  pieces_completed INTEGER DEFAULT 0,
  due_date TEXT,
  assigned_at TEXT,
  completed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS job_fabric_links (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
  fabric_id TEXT NOT NULL REFERENCES fabrics(id),
  meters_reserved REAL DEFAULT 0,
  meters_used REAL DEFAULT 0,
  meters_wasted REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fabrics_tenant ON fabrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tailors_tenant ON tailors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_designs_tenant ON designs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_orders_tenant ON job_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_orders_status ON job_orders(status);
CREATE INDEX IF NOT EXISTS idx_job_orders_tailor ON job_orders(tailor_id);
CREATE INDEX IF NOT EXISTS idx_job_fabric_links_job ON job_fabric_links(job_id);
CREATE INDEX IF NOT EXISTS idx_job_fabric_links_fabric ON job_fabric_links(fabric_id);

-- Unique constraint: one fabric_code per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_fabrics_code_tenant ON fabrics(tenant_id, fabric_code);
