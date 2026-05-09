import { eq, and, sql } from 'drizzle-orm'
import type { AppDb } from '../db'
import { tailors, type Tailor, type NewTailor } from '../db/schema'
import { NotFoundError } from '../utils/errors'

export class TailorRepository {
  constructor(private db: AppDb) {}

  async findAll(tenantId: string): Promise<Tailor[]> {
    return this.db.select().from(tailors).where(eq(tailors.tenantId, tenantId))
  }

  async findActive(tenantId: string): Promise<Tailor[]> {
    return this.db
      .select()
      .from(tailors)
      .where(and(eq(tailors.tenantId, tenantId), eq(tailors.isActive, true)))
  }

  async findById(id: string, tenantId: string): Promise<Tailor | null> {
    const rows = await this.db
      .select()
      .from(tailors)
      .where(and(eq(tailors.id, id), eq(tailors.tenantId, tenantId)))
      .limit(1)
    return rows[0] ?? null
  }

  async findByIdOrThrow(id: string, tenantId: string): Promise<Tailor> {
    const tailor = await this.findById(id, tenantId)
    if (!tailor) throw new NotFoundError('Tailor')
    return tailor
  }

  async create(data: NewTailor): Promise<Tailor> {
    await this.db.insert(tailors).values(data)
    const created = await this.findById(data.id!, data.tenantId)
    if (!created) throw new Error('Failed to create tailor')
    return created
  }

  async update(id: string, tenantId: string, data: Partial<NewTailor>): Promise<Tailor> {
    await this.db
      .update(tailors)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(and(eq(tailors.id, id), eq(tailors.tenantId, tenantId)))
    return this.findByIdOrThrow(id, tenantId)
  }

  async incrementJobCount(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(tailors)
      .set({
        assignedJobsCount: sql`${tailors.assignedJobsCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(tailors.id, id), eq(tailors.tenantId, tenantId)))
  }

  async decrementJobCount(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(tailors)
      .set({
        assignedJobsCount: sql`MAX(0, ${tailors.assignedJobsCount} - 1)`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(tailors.id, id), eq(tailors.tenantId, tenantId)))
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.db
      .delete(tailors)
      .where(and(eq(tailors.id, id), eq(tailors.tenantId, tenantId)))
  }
}
