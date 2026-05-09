import type { FabricRepository } from '../repositories/fabric.repository'
import type { Fabric } from '../db/schema'
import type { CreateFabricInput, UpdateFabricInput } from '../validators/fabric.validator'
import { ConflictError } from '../utils/errors'
import { generateId, now } from '../utils/id'

export class FabricService {
  constructor(private fabricRepo: FabricRepository) {}

  async list(tenantId: string): Promise<Fabric[]> {
    return this.fabricRepo.findAll(tenantId)
  }

  async getById(id: string, tenantId: string): Promise<Fabric> {
    return this.fabricRepo.findByIdOrThrow(id, tenantId)
  }

  async getLowStock(tenantId: string): Promise<Fabric[]> {
    return this.fabricRepo.findLowStock(tenantId)
  }

  async create(tenantId: string, input: CreateFabricInput): Promise<Fabric> {
    const existing = await this.fabricRepo.findByCode(input.fabricCode, tenantId)
    if (existing) {
      throw new ConflictError(`Fabric code "${input.fabricCode}" already exists`)
    }

    const ts = now()
    return this.fabricRepo.create({
      id: generateId(),
      tenantId,
      fabricCode: input.fabricCode,
      type: input.type,
      color: input.color ?? null,
      supplier: input.supplier ?? null,
      initialQty: input.initialQty,
      currentQty: input.initialQty,
      reservedQty: 0,
      costPerMeter: input.costPerMeter ?? 0,
      isClientOwned: input.isClientOwned ?? false,
      clientId: input.clientId ?? null,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      createdAt: ts,
      updatedAt: ts,
    })
  }

  async update(id: string, tenantId: string, input: UpdateFabricInput): Promise<Fabric> {
    await this.fabricRepo.findByIdOrThrow(id, tenantId)

    if (input.fabricCode) {
      const existing = await this.fabricRepo.findByCode(input.fabricCode, tenantId)
      if (existing && existing.id !== id) {
        throw new ConflictError(`Fabric code "${input.fabricCode}" already exists`)
      }
    }

    return this.fabricRepo.update(id, tenantId, {
      ...(input.fabricCode !== undefined && { fabricCode: input.fabricCode }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.supplier !== undefined && { supplier: input.supplier }),
      ...(input.costPerMeter !== undefined && { costPerMeter: input.costPerMeter }),
      ...(input.isClientOwned !== undefined && { isClientOwned: input.isClientOwned }),
      ...(input.clientId !== undefined && { clientId: input.clientId }),
      ...(input.lowStockThreshold !== undefined && { lowStockThreshold: input.lowStockThreshold }),
    })
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.fabricRepo.findByIdOrThrow(id, tenantId)
    await this.fabricRepo.delete(id, tenantId)
  }
}
