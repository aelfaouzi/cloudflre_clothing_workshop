import type { TailorRepository } from '../repositories/tailor.repository'
import type { Tailor } from '../db/schema'
import type { CreateTailorInput, UpdateTailorInput } from '../validators/tailor.validator'
import { generateId, now } from '../utils/id'

export class TailorService {
  constructor(private tailorRepo: TailorRepository) {}

  async list(tenantId: string): Promise<Tailor[]> {
    return this.tailorRepo.findAll(tenantId)
  }

  async listActive(tenantId: string): Promise<Tailor[]> {
    return this.tailorRepo.findActive(tenantId)
  }

  async getById(id: string, tenantId: string): Promise<Tailor> {
    return this.tailorRepo.findByIdOrThrow(id, tenantId)
  }

  async create(tenantId: string, input: CreateTailorInput): Promise<Tailor> {
    const ts = now()
    return this.tailorRepo.create({
      id: generateId(),
      tenantId,
      name: input.name,
      phone: input.phone ?? null,
      paymentType: input.paymentType ?? 'per_piece',
      payRatePerPiece: input.payRatePerPiece ?? 0,
      payRatePerWeek: input.payRatePerWeek ?? 0,
      isActive: input.isActive ?? true,
      assignedJobsCount: 0,
      createdAt: ts,
      updatedAt: ts,
    })
  }

  async update(id: string, tenantId: string, input: UpdateTailorInput): Promise<Tailor> {
    await this.tailorRepo.findByIdOrThrow(id, tenantId)
    return this.tailorRepo.update(id, tenantId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.paymentType !== undefined && { paymentType: input.paymentType }),
      ...(input.payRatePerPiece !== undefined && { payRatePerPiece: input.payRatePerPiece }),
      ...(input.payRatePerWeek !== undefined && { payRatePerWeek: input.payRatePerWeek }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    })
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.tailorRepo.findByIdOrThrow(id, tenantId)
    await this.tailorRepo.delete(id, tenantId)
  }
}
