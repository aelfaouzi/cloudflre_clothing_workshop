export type JobStatus = 'DRAFT' | 'CUTTING' | 'SEWING' | 'READY' | 'DISPATCHED' | 'CANCELED'
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export interface Fabric {
  id: string
  tenantId: string
  fabricCode: string
  type: string
  color: string | null
  supplier: string | null
  initialQty: number
  currentQty: number
  reservedQty: number
  availableQty?: number
  costPerMeter: number
  isClientOwned: boolean
  clientId: string | null
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

export type PaymentType = 'per_piece' | 'per_week'

export interface Tailor {
  id: string
  tenantId: string
  name: string
  phone: string | null
  paymentType: PaymentType
  payRatePerPiece: number
  payRatePerWeek: number
  isActive: boolean
  assignedJobsCount: number
  createdAt: string
  updatedAt: string
}

export interface Design {
  id: string
  tenantId: string
  name: string
  targetAudience: string | null
  sizeConfigJson: string
  createdAt: string
  updatedAt: string
}

export interface JobFabricLink {
  id: string
  jobId: string
  fabricId: string
  metersReserved: number
  metersUsed: number
  metersWasted: number
  fabric: Fabric
  createdAt: string
  updatedAt: string
}

export interface JobOrder {
  id: string
  tenantId: string
  jobNumber: string
  designId: string | null
  status: JobStatus
  tailorId: string | null
  priority: Priority | null
  piecesExpected: number
  piecesCompleted: number
  dueDate: string | null
  assignedAt: string | null
  completedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  tailor?: Tailor | null
  design?: Design | null
  fabricLinks?: JobFabricLink[]
}

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

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  success: false
  error: {
    message: string
    code: string
    issues?: Record<string, string[]>
  }
}

// Form input types
export interface CreateFabricInput {
  fabricCode: string
  type: string
  color?: string
  supplier?: string
  initialQty: number
  costPerMeter?: number
  isClientOwned?: boolean
  lowStockThreshold?: number
}

export interface UpdateFabricInput {
  fabricCode?: string
  type?: string
  color?: string
  supplier?: string
  costPerMeter?: number
  lowStockThreshold?: number
}

export interface CreateTailorInput {
  name: string
  phone?: string
  paymentType?: PaymentType
  payRatePerPiece?: number
  payRatePerWeek?: number
  isActive?: boolean
}

export interface UpdateTailorInput {
  name?: string
  phone?: string
  paymentType?: PaymentType
  payRatePerPiece?: number
  payRatePerWeek?: number
  isActive?: boolean
}

export interface FabricLinkInput {
  fabricId: string
  metersReserved: number
}

export interface CreateJobInput {
  designId?: string
  tailorId?: string
  priority?: Priority
  piecesExpected: number
  dueDate?: string
  notes?: string
  fabricLinks?: FabricLinkInput[]
}

export interface UpdateJobInput {
  designId?: string
  tailorId?: string
  priority?: Priority
  piecesExpected?: number
  dueDate?: string
  notes?: string
  fabricLinks?: FabricLinkInput[]
}

export interface TransitionJobInput {
  targetStatus: JobStatus
  metersUsed?: { fabricId: string; metersUsed: number; metersWasted?: number }[]
  piecesCompleted?: number
}
