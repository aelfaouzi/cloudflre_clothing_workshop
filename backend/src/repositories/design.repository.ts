import { eq, and } from 'drizzle-orm'
import type { AppDb } from '../db'
import { designs, type Design, type NewDesign } from '../db/schema'
import { NotFoundError } from '../utils/errors'

export class DesignRepository {
  constructor(private db: AppDb) {}

  async findAll(tenantId: string): Promise<Design[]> {
    return this.db.select().from(designs).where(eq(designs.tenantId, tenantId))
  }

  async findById(id: string, tenantId: string): Promise<Design | null> {
    const rows = await this.db
      .select()
      .from(designs)
      .where(and(eq(designs.id, id), eq(designs.tenantId, tenantId)))
      .limit(1)
    return rows[0] ?? null
  }

  async findByIdOrThrow(id: string, tenantId: string): Promise<Design> {
    const design = await this.findById(id, tenantId)
    if (!design) throw new NotFoundError('Design')
    return design
  }

  async create(data: NewDesign): Promise<Design> {
    await this.db.insert(designs).values(data)
    const created = await this.findById(data.id!, data.tenantId)
    if (!created) throw new Error('Failed to create design')
    return created
  }

  async update(id: string, tenantId: string, data: Partial<NewDesign>): Promise<Design> {
    await this.db
      .update(designs)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(and(eq(designs.id, id), eq(designs.tenantId, tenantId)))
    return this.findByIdOrThrow(id, tenantId)
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.db.delete(designs).where(and(eq(designs.id, id), eq(designs.tenantId, tenantId)))
  }
}
