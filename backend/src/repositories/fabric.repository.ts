import { eq, and, lt, sql } from 'drizzle-orm'
import type { AppDb } from '../db'
import { fabrics, type Fabric, type NewFabric } from '../db/schema'
import { NotFoundError } from '../utils/errors'

export class FabricRepository {
  constructor(private db: AppDb) {}

  async findAll(tenantId: string): Promise<Fabric[]> {
    return this.db.select().from(fabrics).where(eq(fabrics.tenantId, tenantId))
  }

  async findById(id: string, tenantId: string): Promise<Fabric | null> {
    const rows = await this.db
      .select()
      .from(fabrics)
      .where(and(eq(fabrics.id, id), eq(fabrics.tenantId, tenantId)))
      .limit(1)
    return rows[0] ?? null
  }

  async findByIdOrThrow(id: string, tenantId: string): Promise<Fabric> {
    const fabric = await this.findById(id, tenantId)
    if (!fabric) throw new NotFoundError('Fabric')
    return fabric
  }

  async findByCode(fabricCode: string, tenantId: string): Promise<Fabric | null> {
    const rows = await this.db
      .select()
      .from(fabrics)
      .where(and(eq(fabrics.fabricCode, fabricCode), eq(fabrics.tenantId, tenantId)))
      .limit(1)
    return rows[0] ?? null
  }

  async findLowStock(tenantId: string): Promise<Fabric[]> {
    return this.db
      .select()
      .from(fabrics)
      .where(
        and(
          eq(fabrics.tenantId, tenantId),
          sql`${fabrics.currentQty} < ${fabrics.lowStockThreshold}`,
        ),
      )
  }

  async create(data: NewFabric): Promise<Fabric> {
    await this.db.insert(fabrics).values(data)
    const created = await this.findById(data.id!, data.tenantId)
    if (!created) throw new Error('Failed to create fabric')
    return created
  }

  async update(id: string, tenantId: string, data: Partial<NewFabric>): Promise<Fabric> {
    await this.db
      .update(fabrics)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(and(eq(fabrics.id, id), eq(fabrics.tenantId, tenantId)))
    return this.findByIdOrThrow(id, tenantId)
  }

  async incrementReserved(id: string, tenantId: string, meters: number): Promise<void> {
    await this.db
      .update(fabrics)
      .set({
        reservedQty: sql`${fabrics.reservedQty} + ${meters}`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(fabrics.id, id), eq(fabrics.tenantId, tenantId)))
  }

  async decrementReservedAndCurrent(
    id: string,
    tenantId: string,
    metersUsed: number,
    metersReserved: number,
  ): Promise<void> {
    await this.db
      .update(fabrics)
      .set({
        currentQty: sql`${fabrics.currentQty} - ${metersUsed}`,
        reservedQty: sql`${fabrics.reservedQty} - ${metersReserved}`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(fabrics.id, id), eq(fabrics.tenantId, tenantId)))
  }

  async releaseReserved(id: string, tenantId: string, meters: number): Promise<void> {
    await this.db
      .update(fabrics)
      .set({
        reservedQty: sql`MAX(0, ${fabrics.reservedQty} - ${meters})`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(fabrics.id, id), eq(fabrics.tenantId, tenantId)))
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.db
      .delete(fabrics)
      .where(and(eq(fabrics.id, id), eq(fabrics.tenantId, tenantId)))
  }
}
