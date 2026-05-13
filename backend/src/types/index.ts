export type JobStatus = 'DRAFT' | 'CUTTING' | 'SEWING' | 'READY' | 'DISPATCHED' | 'CANCELED'
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  CLERK_SECRET_KEY: string
  CLERK_JWT_KEY: string | undefined
  CORS_ORIGIN: string
  ENVIRONMENT: string
}

export interface AuthVariables {
  userId: string
  tenantId: string
}

export type AppContext = {
  Bindings: Env
  Variables: AuthVariables
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface ListResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export const JOB_STATUS_ORDER: JobStatus[] = [
  'DRAFT',
  'CUTTING',
  'SEWING',
  'READY',
  'DISPATCHED',
  'CANCELED',
]

export const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  DRAFT: ['CUTTING', 'CANCELED'],
  CUTTING: ['SEWING', 'CANCELED'],
  SEWING: ['READY', 'CANCELED'],
  READY: ['DISPATCHED', 'CANCELED'],
  DISPATCHED: [],
  CANCELED: [],
}
