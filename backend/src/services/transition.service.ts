import type { JobRepository } from '../repositories/job.repository'
import type { FabricRepository } from '../repositories/fabric.repository'
import type { TailorRepository } from '../repositories/tailor.repository'
import type { JobOrder } from '../db/schema'
import { ALLOWED_TRANSITIONS, type JobStatus } from '../types'
import { BusinessError, NotFoundError } from '../utils/errors'
import { now } from '../utils/id'

interface MetersUsedEntry {
  fabricId: string
  metersUsed: number
  metersWasted: number
}

interface TransitionData {
  metersUsed?: MetersUsedEntry[]
  piecesCompleted?: number
}

export class TransitionService {
  constructor(
    private jobRepo: JobRepository,
    private fabricRepo: FabricRepository,
    private tailorRepo: TailorRepository,
  ) {}

  async transitionJob(
    jobId: string,
    targetStatus: JobStatus,
    tenantId: string,
    data?: TransitionData,
  ): Promise<JobOrder> {
    const job = await this.jobRepo.findByIdOrThrow(jobId, tenantId)
    const currentStatus = job.status as JobStatus

    this.validateTransition(currentStatus, targetStatus)

    switch (true) {
      case currentStatus === 'DRAFT' && targetStatus === 'CUTTING':
        return this.handleDraftToCutting(job, tenantId)

      case currentStatus === 'CUTTING' && targetStatus === 'SEWING':
        return this.handleCuttingToSewing(job, tenantId, data?.metersUsed ?? [])

      case currentStatus === 'SEWING' && targetStatus === 'READY':
        return this.handleSewingToReady(job, tenantId, data?.piecesCompleted)

      case currentStatus === 'READY' && targetStatus === 'DISPATCHED':
        return this.handleReadyToDispatched(job, tenantId)

      case targetStatus === 'CANCELED':
        return this.handleCancellation(job, tenantId)

      default:
        throw new BusinessError(`Unhandled transition: ${currentStatus} → ${targetStatus}`)
    }
  }

  private validateTransition(from: JobStatus, to: JobStatus): void {
    const allowed = ALLOWED_TRANSITIONS[from]
    if (!allowed.includes(to)) {
      throw new BusinessError(
        `Cannot transition from ${from} to ${to}. Allowed: ${allowed.join(', ') || 'none'}`,
      )
    }
  }

  private async handleDraftToCutting(job: JobOrder, tenantId: string): Promise<JobOrder> {
    const links = await this.jobRepo.findFabricLinks(job.id)

    if (links.length === 0) {
      throw new BusinessError('Job must have at least one fabric assigned before cutting')
    }

    if (!job.tailorId) {
      throw new BusinessError('Job must have a tailor assigned before cutting')
    }

    // Validate fabric availability and reserve stock
    for (const link of links) {
      const fabric = await this.fabricRepo.findByIdOrThrow(link.fabricId, tenantId)
      const available = fabric.currentQty - fabric.reservedQty
      const needed = link.metersReserved ?? 0

      if (available < needed) {
        throw new BusinessError(
          `Insufficient fabric "${fabric.fabricCode}": available ${available.toFixed(2)}m, needed ${needed.toFixed(2)}m`,
        )
      }

      await this.fabricRepo.incrementReserved(fabric.id, tenantId, needed)
    }

    // Update tailor assigned_jobs_count
    await this.tailorRepo.incrementJobCount(job.tailorId, tenantId)

    return this.jobRepo.update(job.id, tenantId, {
      status: 'CUTTING',
      assignedAt: now(),
    })
  }

  private async handleCuttingToSewing(
    job: JobOrder,
    tenantId: string,
    metersUsedEntries: MetersUsedEntry[],
  ): Promise<JobOrder> {
    const links = await this.jobRepo.findFabricLinks(job.id)

    // Deduct actual usage for each fabric link
    for (const link of links) {
      const entry = metersUsedEntries.find((e) => e.fabricId === link.fabricId)
      const metersUsed = entry?.metersUsed ?? link.metersReserved ?? 0
      const metersWasted = entry?.metersWasted ?? 0
      const metersReserved = link.metersReserved ?? 0

      await this.fabricRepo.decrementReservedAndCurrent(
        link.fabricId,
        tenantId,
        metersUsed,
        metersReserved,
      )

      await this.jobRepo.updateFabricLink(link.id, {
        metersUsed,
        metersWasted,
      })
    }

    return this.jobRepo.update(job.id, tenantId, { status: 'SEWING' })
  }

  private async handleSewingToReady(
    job: JobOrder,
    tenantId: string,
    piecesCompleted?: number,
  ): Promise<JobOrder> {
    const completedAt = now()

    return this.jobRepo.update(job.id, tenantId, {
      status: 'READY',
      completedAt,
      ...(piecesCompleted !== undefined ? { piecesCompleted } : {}),
    })
  }

  private async handleReadyToDispatched(job: JobOrder, tenantId: string): Promise<JobOrder> {
    if (job.tailorId) {
      await this.tailorRepo.decrementJobCount(job.tailorId, tenantId)
    }

    return this.jobRepo.update(job.id, tenantId, { status: 'DISPATCHED' })
  }

  private async handleCancellation(job: JobOrder, tenantId: string): Promise<JobOrder> {
    // Only release reserved fabric if job was in CUTTING state (reserved but not yet deducted)
    if (job.status === 'CUTTING') {
      const links = await this.jobRepo.findFabricLinks(job.id)
      for (const link of links) {
        await this.fabricRepo.releaseReserved(link.fabricId, tenantId, link.metersReserved ?? 0)
      }
    }

    // Release tailor workload if assigned
    if (job.tailorId && ['CUTTING', 'SEWING', 'READY'].includes(job.status)) {
      await this.tailorRepo.decrementJobCount(job.tailorId, tenantId)
    }

    return this.jobRepo.update(job.id, tenantId, { status: 'CANCELED' })
  }
}
