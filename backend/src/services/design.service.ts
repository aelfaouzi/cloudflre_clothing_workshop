import type { DesignRepository } from '../repositories/design.repository'
import type { Design } from '../db/schema'
import type { CreateDesignInput, UpdateDesignInput } from '../validators/job.validator'
import { generateId, now } from '../utils/id'

export class DesignService {
  constructor(private designRepo: DesignRepository) {}

  async list(tenantId: string): Promise<Design[]> {
    return this.designRepo.findAll(tenantId)
  }

  async getById(id: string, tenantId: string): Promise<Design> {
    return this.designRepo.findByIdOrThrow(id, tenantId)
  }

  async create(tenantId: string, input: CreateDesignInput): Promise<Design> {
    const ts = now()
    return this.designRepo.create({
      id: generateId(),
      tenantId,
      name: input.name,
      targetAudience: input.targetAudience ?? null,
      sizeConfigJson: input.sizeConfigJson ?? '{}',
      createdAt: ts,
      updatedAt: ts,
    })
  }

  async update(id: string, tenantId: string, input: UpdateDesignInput): Promise<Design> {
    await this.designRepo.findByIdOrThrow(id, tenantId)
    return this.designRepo.update(id, tenantId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.targetAudience !== undefined && { targetAudience: input.targetAudience }),
      ...(input.sizeConfigJson !== undefined && { sizeConfigJson: input.sizeConfigJson }),
    })
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.designRepo.findByIdOrThrow(id, tenantId)
    await this.designRepo.delete(id, tenantId)
  }
}
