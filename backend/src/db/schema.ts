import { sqliteTable, text, real, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const designs = sqliteTable(
  'designs',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    name: text('name').notNull(),
    targetAudience: text('target_audience'),
    sizeConfigJson: text('size_config_json').default('{}'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    tenantIdx: index('idx_designs_tenant').on(t.tenantId),
  }),
)

export const tailors = sqliteTable(
  'tailors',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    name: text('name').notNull(),
    phone: text('phone'),
    paymentType: text('payment_type', { enum: ['per_piece', 'per_week'] }).default('per_piece'),
    payRatePerPiece: real('pay_rate_per_piece').default(0),
    payRatePerWeek: real('pay_rate_per_week').default(0),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    assignedJobsCount: integer('assigned_jobs_count').default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    tenantIdx: index('idx_tailors_tenant').on(t.tenantId),
  }),
)

export const fabrics = sqliteTable(
  'fabrics',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    fabricCode: text('fabric_code').notNull(),
    type: text('type').notNull(),
    color: text('color'),
    supplier: text('supplier'),
    initialQty: real('initial_qty').notNull().default(0),
    currentQty: real('current_qty').notNull().default(0),
    reservedQty: real('reserved_qty').notNull().default(0),
    costPerMeter: real('cost_per_meter').default(0),
    isClientOwned: integer('is_client_owned', { mode: 'boolean' }).default(false),
    clientId: text('client_id'),
    lowStockThreshold: real('low_stock_threshold').default(5),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    tenantIdx: index('idx_fabrics_tenant').on(t.tenantId),
    codeUniqueIdx: uniqueIndex('idx_fabrics_code_tenant').on(t.tenantId, t.fabricCode),
  }),
)

export const jobOrders = sqliteTable(
  'job_orders',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    jobNumber: text('job_number').notNull(),
    designId: text('design_id').references(() => designs.id),
    status: text('status', {
      enum: ['DRAFT', 'CUTTING', 'SEWING', 'READY', 'DISPATCHED', 'CANCELED'],
    })
      .notNull()
      .default('DRAFT'),
    tailorId: text('tailor_id').references(() => tailors.id),
    priority: text('priority', { enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] }).default('NORMAL'),
    piecesExpected: integer('pieces_expected').default(0),
    piecesCompleted: integer('pieces_completed').default(0),
    dueDate: text('due_date'),
    assignedAt: text('assigned_at'),
    completedAt: text('completed_at'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    tenantIdx: index('idx_job_orders_tenant').on(t.tenantId),
    statusIdx: index('idx_job_orders_status').on(t.status),
    tailorIdx: index('idx_job_orders_tailor').on(t.tailorId),
  }),
)

export const jobFabricLinks = sqliteTable(
  'job_fabric_links',
  {
    id: text('id').primaryKey(),
    jobId: text('job_id')
      .notNull()
      .references(() => jobOrders.id, { onDelete: 'cascade' }),
    fabricId: text('fabric_id')
      .notNull()
      .references(() => fabrics.id),
    metersReserved: real('meters_reserved').default(0),
    metersUsed: real('meters_used').default(0),
    metersWasted: real('meters_wasted').default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    jobIdx: index('idx_job_fabric_links_job').on(t.jobId),
    fabricIdx: index('idx_job_fabric_links_fabric').on(t.fabricId),
  }),
)

// Relations
export const fabricsRelations = relations(fabrics, ({ many }) => ({
  jobLinks: many(jobFabricLinks),
}))

export const tailorsRelations = relations(tailors, ({ many }) => ({
  jobs: many(jobOrders),
}))

export const designsRelations = relations(designs, ({ many }) => ({
  jobs: many(jobOrders),
}))

export const jobOrdersRelations = relations(jobOrders, ({ one, many }) => ({
  tailor: one(tailors, { fields: [jobOrders.tailorId], references: [tailors.id] }),
  design: one(designs, { fields: [jobOrders.designId], references: [designs.id] }),
  fabricLinks: many(jobFabricLinks),
}))

export const jobFabricLinksRelations = relations(jobFabricLinks, ({ one }) => ({
  job: one(jobOrders, { fields: [jobFabricLinks.jobId], references: [jobOrders.id] }),
  fabric: one(fabrics, { fields: [jobFabricLinks.fabricId], references: [fabrics.id] }),
}))

export type Fabric = typeof fabrics.$inferSelect
export type NewFabric = typeof fabrics.$inferInsert
export type Tailor = typeof tailors.$inferSelect
export type NewTailor = typeof tailors.$inferInsert
export type Design = typeof designs.$inferSelect
export type NewDesign = typeof designs.$inferInsert
export type JobOrder = typeof jobOrders.$inferSelect
export type NewJobOrder = typeof jobOrders.$inferInsert
export type JobFabricLink = typeof jobFabricLinks.$inferSelect
export type NewJobFabricLink = typeof jobFabricLinks.$inferInsert
