import type { JobRepository } from '../repositories/job.repository'
import type { FabricRepository } from '../repositories/fabric.repository'
import type { TailorRepository } from '../repositories/tailor.repository'
import type { JobStatus } from '../types'

export interface DashboardData {
  summary: {
    totalActiveJobs: number
    jobsByStatus: Record<JobStatus, number>
    delayedJobs: number
  }
  tailorWorkload: {
    tailorId: string
    name: string
    assignedJobsCount: number
    isActive: boolean
  }[]
  lowStockFabrics: {
    id: string
    fabricCode: string
    type: string
    color: string | null
    currentQty: number
    reservedQty: number
    availableQty: number
    lowStockThreshold: number
  }[]
  recentJobs: {
    id: string
    jobNumber: string
    status: string
    priority: string | null
    piecesExpected: number
    dueDate: string | null
    createdAt: string
  }[]
}

export class DashboardService {
  constructor(
    private jobRepo: JobRepository,
    private fabricRepo: FabricRepository,
    private tailorRepo: TailorRepository,
  ) {}

  async getDashboard(tenantId: string): Promise<DashboardData> {
    const [allJobs, allTailors, lowStockFabrics] = await Promise.all([
      this.jobRepo.findAll(tenantId),
      this.tailorRepo.findAll(tenantId),
      this.fabricRepo.findLowStock(tenantId),
    ])

    const today = new Date().toISOString().split('T')[0]!

    const activeStatuses: JobStatus[] = ['DRAFT', 'CUTTING', 'SEWING', 'READY']
    const activeJobs = allJobs.filter((j) => activeStatuses.includes(j.status as JobStatus))

    const jobsByStatus = allJobs.reduce(
      (acc, job) => {
        const s = job.status as JobStatus
        acc[s] = (acc[s] ?? 0) + 1
        return acc
      },
      {} as Record<JobStatus, number>,
    )

    const allStatuses: JobStatus[] = ['DRAFT', 'CUTTING', 'SEWING', 'READY', 'DISPATCHED', 'CANCELED']
    for (const s of allStatuses) {
      jobsByStatus[s] = jobsByStatus[s] ?? 0
    }

    const delayedJobs = allJobs.filter(
      (j) =>
        j.dueDate &&
        j.dueDate < today &&
        !['DISPATCHED', 'CANCELED'].includes(j.status),
    ).length

    const tailorWorkload = allTailors.map((t) => ({
      tailorId: t.id,
      name: t.name,
      assignedJobsCount: t.assignedJobsCount ?? 0,
      isActive: t.isActive ?? true,
    }))

    const lowStock = lowStockFabrics.map((f) => ({
      id: f.id,
      fabricCode: f.fabricCode,
      type: f.type,
      color: f.color,
      currentQty: f.currentQty,
      reservedQty: f.reservedQty,
      availableQty: f.currentQty - f.reservedQty,
      lowStockThreshold: f.lowStockThreshold ?? 5,
    }))

    const recentJobs = allJobs
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10)
      .map((j) => ({
        id: j.id,
        jobNumber: j.jobNumber,
        status: j.status,
        priority: j.priority,
        piecesExpected: j.piecesExpected ?? 0,
        dueDate: j.dueDate,
        createdAt: j.createdAt,
      }))

    return {
      summary: {
        totalActiveJobs: activeJobs.length,
        jobsByStatus,
        delayedJobs,
      },
      tailorWorkload,
      lowStockFabrics: lowStock,
      recentJobs,
    }
  }
}
