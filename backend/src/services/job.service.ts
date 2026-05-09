import type { JobRepository } from '../repositories/job.repository'
import type { FabricRepository } from '../repositories/fabric.repository'
import type { TailorRepository } from '../repositories/tailor.repository'
import type { DesignRepository } from '../repositories/design.repository'
import type { JobOrder } from '../db/schema'
import type { JobWithRelations } from '../repositories/job.repository'
import type { CreateJobInput, UpdateJobInput } from '../validators/job.validator'
import { BusinessError, NotFoundError } from '../utils/errors'
import { generateId, generateJobNumber, now } from '../utils/id'

export class JobService {
  constructor(
    private jobRepo: JobRepository,
    private fabricRepo: FabricRepository,
    private tailorRepo: TailorRepository,
    private designRepo: DesignRepository,
  ) {}

  async list(tenantId: string): Promise<JobOrder[]> {
    return this.jobRepo.findAll(tenantId)
  }

  async getById(id: string, tenantId: string): Promise<JobWithRelations> {
    const job = await this.jobRepo.findWithRelations(id, tenantId)
    if (!job) throw new NotFoundError('Job')
    return job
  }

  async create(tenantId: string, input: CreateJobInput): Promise<JobWithRelations> {
    // Validate tailor exists if provided
    if (input.tailorId) {
      const tailor = await this.tailorRepo.findById(input.tailorId, tenantId)
      if (!tailor) throw new NotFoundError('Tailor')
      if (!tailor.isActive) throw new BusinessError('Cannot assign job to inactive tailor')
    }

    // Validate design exists if provided
    if (input.designId) {
      await this.designRepo.findByIdOrThrow(input.designId, tenantId)
    }

    const ts = now()
    const jobId = generateId()

    const job = await this.jobRepo.create({
      id: jobId,
      tenantId,
      jobNumber: generateJobNumber(),
      designId: input.designId ?? null,
      status: 'DRAFT',
      tailorId: input.tailorId ?? null,
      priority: input.priority ?? 'NORMAL',
      piecesExpected: input.piecesExpected,
      piecesCompleted: 0,
      dueDate: input.dueDate ?? null,
      assignedAt: null,
      completedAt: null,
      notes: input.notes ?? null,
      createdAt: ts,
      updatedAt: ts,
    })

    // Create fabric links
    for (const link of input.fabricLinks ?? []) {
      await this.fabricRepo.findByIdOrThrow(link.fabricId, tenantId)
      await this.jobRepo.addFabricLink({
        id: generateId(),
        jobId: job.id,
        fabricId: link.fabricId,
        metersReserved: link.metersReserved,
        metersUsed: 0,
        metersWasted: 0,
        createdAt: ts,
        updatedAt: ts,
      })
    }

    const jobWithRelations = await this.jobRepo.findWithRelations(job.id, tenantId)
    if (!jobWithRelations) throw new Error('Failed to load created job')
    return jobWithRelations
  }

  async update(id: string, tenantId: string, input: UpdateJobInput): Promise<JobWithRelations> {
    const job = await this.jobRepo.findByIdOrThrow(id, tenantId)

    if (job.status !== 'DRAFT') {
      throw new BusinessError('Only DRAFT jobs can be edited directly')
    }

    if (input.tailorId) {
      const tailor = await this.tailorRepo.findById(input.tailorId, tenantId)
      if (!tailor) throw new NotFoundError('Tailor')
      if (!tailor.isActive) throw new BusinessError('Cannot assign job to inactive tailor')
    }

    if (input.designId) {
      await this.designRepo.findByIdOrThrow(input.designId, tenantId)
    }

    await this.jobRepo.update(id, tenantId, {
      ...(input.designId !== undefined && { designId: input.designId }),
      ...(input.tailorId !== undefined && { tailorId: input.tailorId }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.piecesExpected !== undefined && { piecesExpected: input.piecesExpected }),
      ...(input.piecesCompleted !== undefined && { piecesCompleted: input.piecesCompleted }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      ...(input.notes !== undefined && { notes: input.notes }),
    })

    // Replace fabric links if provided
    if (input.fabricLinks !== undefined) {
      await this.jobRepo.removeFabricLinks(id)
      const ts = now()
      for (const link of input.fabricLinks) {
        await this.fabricRepo.findByIdOrThrow(link.fabricId, tenantId)
        await this.jobRepo.addFabricLink({
          id: generateId(),
          jobId: id,
          fabricId: link.fabricId,
          metersReserved: link.metersReserved,
          metersUsed: 0,
          metersWasted: 0,
          createdAt: ts,
          updatedAt: ts,
        })
      }
    }

    const updated = await this.jobRepo.findWithRelations(id, tenantId)
    if (!updated) throw new Error('Failed to load updated job')
    return updated
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const job = await this.jobRepo.findByIdOrThrow(id, tenantId)
    if (!['DRAFT', 'CANCELED'].includes(job.status)) {
      throw new BusinessError('Only DRAFT or CANCELED jobs can be deleted')
    }
    await this.jobRepo.delete(id, tenantId)
  }
}
