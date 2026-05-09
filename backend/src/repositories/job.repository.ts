import { eq, and, ne, inArray } from 'drizzle-orm'
import type { AppDb } from '../db'
import {
  jobOrders,
  jobFabricLinks,
  fabrics,
  tailors,
  designs,
  type JobOrder,
  type NewJobOrder,
  type JobFabricLink,
  type NewJobFabricLink,
} from '../db/schema'
import { NotFoundError } from '../utils/errors'
import type { JobStatus } from '../types'

export interface JobWithRelations extends JobOrder {
  tailor: typeof tailors.$inferSelect | null
  design: typeof designs.$inferSelect | null
  fabricLinks: (JobFabricLink & { fabric: typeof fabrics.$inferSelect })[]
}

export class JobRepository {
  constructor(private db: AppDb) {}

  async findAll(tenantId: string): Promise<JobOrder[]> {
    return this.db.select().from(jobOrders).where(eq(jobOrders.tenantId, tenantId))
  }

  async findByStatus(tenantId: string, status: JobStatus): Promise<JobOrder[]> {
    return this.db
      .select()
      .from(jobOrders)
      .where(and(eq(jobOrders.tenantId, tenantId), eq(jobOrders.status, status)))
  }

  async findActive(tenantId: string): Promise<JobOrder[]> {
    return this.db
      .select()
      .from(jobOrders)
      .where(
        and(
          eq(jobOrders.tenantId, tenantId),
          inArray(jobOrders.status, ['DRAFT', 'CUTTING', 'SEWING', 'READY']),
        ),
      )
  }

  async findById(id: string, tenantId: string): Promise<JobOrder | null> {
    const rows = await this.db
      .select()
      .from(jobOrders)
      .where(and(eq(jobOrders.id, id), eq(jobOrders.tenantId, tenantId)))
      .limit(1)
    return rows[0] ?? null
  }

  async findByIdOrThrow(id: string, tenantId: string): Promise<JobOrder> {
    const job = await this.findById(id, tenantId)
    if (!job) throw new NotFoundError('Job')
    return job
  }

  async findWithRelations(id: string, tenantId: string): Promise<JobWithRelations | null> {
    const job = await this.findById(id, tenantId)
    if (!job) return null

    const [links, tailorRow, designRow] = await Promise.all([
      this.findFabricLinks(id),
      job.tailorId
        ? this.db
            .select()
            .from(tailors)
            .where(eq(tailors.id, job.tailorId))
            .limit(1)
            .then((r) => r[0] ?? null)
        : Promise.resolve(null),
      job.designId
        ? this.db
            .select()
            .from(designs)
            .where(eq(designs.id, job.designId))
            .limit(1)
            .then((r) => r[0] ?? null)
        : Promise.resolve(null),
    ])

    const linksWithFabrics = await Promise.all(
      links.map(async (link) => {
        const fabricRow = await this.db
          .select()
          .from(fabrics)
          .where(eq(fabrics.id, link.fabricId))
          .limit(1)
          .then((r) => r[0])
        return { ...link, fabric: fabricRow! }
      }),
    )

    return { ...job, tailor: tailorRow, design: designRow, fabricLinks: linksWithFabrics }
  }

  async findFabricLinks(jobId: string): Promise<JobFabricLink[]> {
    return this.db.select().from(jobFabricLinks).where(eq(jobFabricLinks.jobId, jobId))
  }

  async findByTailor(tailorId: string, tenantId: string): Promise<JobOrder[]> {
    return this.db
      .select()
      .from(jobOrders)
      .where(and(eq(jobOrders.tailorId, tailorId), eq(jobOrders.tenantId, tenantId)))
  }

  async create(data: NewJobOrder): Promise<JobOrder> {
    await this.db.insert(jobOrders).values(data)
    const created = await this.findById(data.id!, data.tenantId)
    if (!created) throw new Error('Failed to create job')
    return created
  }

  async update(id: string, tenantId: string, data: Partial<NewJobOrder>): Promise<JobOrder> {
    await this.db
      .update(jobOrders)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(and(eq(jobOrders.id, id), eq(jobOrders.tenantId, tenantId)))
    return this.findByIdOrThrow(id, tenantId)
  }

  async addFabricLink(data: NewJobFabricLink): Promise<JobFabricLink> {
    await this.db.insert(jobFabricLinks).values(data)
    const rows = await this.db
      .select()
      .from(jobFabricLinks)
      .where(eq(jobFabricLinks.id, data.id!))
      .limit(1)
    if (!rows[0]) throw new Error('Failed to create fabric link')
    return rows[0]
  }

  async removeFabricLinks(jobId: string): Promise<void> {
    await this.db.delete(jobFabricLinks).where(eq(jobFabricLinks.jobId, jobId))
  }

  async updateFabricLink(
    linkId: string,
    data: Partial<NewJobFabricLink>,
  ): Promise<void> {
    await this.db
      .update(jobFabricLinks)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(jobFabricLinks.id, linkId))
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.db
      .delete(jobOrders)
      .where(and(eq(jobOrders.id, id), eq(jobOrders.tenantId, tenantId)))
  }
}
