import type {
  Fabric,
  Tailor,
  Design,
  JobOrder,
  DashboardData,
  CreateFabricInput,
  UpdateFabricInput,
  CreateTailorInput,
  UpdateTailorInput,
  CreateJobInput,
  UpdateJobInput,
  TransitionJobInput,
  ApiResponse,
} from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

let getTokenFn: (() => Promise<string | null>) | null = null

export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getTokenFn ? await getTokenFn() : null

  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  // 204 No Content — DELETE endpoints return an empty body
  if (res.status === 204) {
    return undefined as T
  }

  const body = await res.json() as ApiResponse<T> | { success: false; error: { message: string; code: string } }

  if (!res.ok || !body.success) {
    const errBody = body as { success: false; error: { message: string; code: string } }
    throw new Error(errBody.error?.message ?? `Request failed: ${res.status}`)
  }

  return (body as ApiResponse<T>).data
}

// Fabrics
export const fabricsApi = {
  list: () => request<Fabric[]>('/fabrics'),
  getById: (id: string) => request<Fabric>(`/fabrics/${id}`),
  lowStock: () => request<Fabric[]>('/fabrics/low-stock'),
  create: (data: CreateFabricInput) => request<Fabric>('/fabrics', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateFabricInput) => request<Fabric>(`/fabrics/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/fabrics/${id}`, { method: 'DELETE' }),
}

// Tailors
export const tailorsApi = {
  list: () => request<Tailor[]>('/tailors'),
  active: () => request<Tailor[]>('/tailors/active'),
  getById: (id: string) => request<Tailor>(`/tailors/${id}`),
  create: (data: CreateTailorInput) => request<Tailor>('/tailors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateTailorInput) => request<Tailor>(`/tailors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/tailors/${id}`, { method: 'DELETE' }),
}

// Jobs
export const jobsApi = {
  list: () => request<JobOrder[]>('/jobs'),
  getById: (id: string) => request<JobOrder>(`/jobs/${id}`),
  create: (data: CreateJobInput) => request<JobOrder>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateJobInput) => request<JobOrder>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  transition: (id: string, data: TransitionJobInput) => request<JobOrder>(`/jobs/${id}/transition`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/jobs/${id}`, { method: 'DELETE' }),
}

// Designs
export const designsApi = {
  list: () => request<Design[]>('/designs'),
  create: (data: { name: string; targetAudience?: string }) => request<Design>('/designs', { method: 'POST', body: JSON.stringify(data) }),
}

// Dashboard
export const dashboardApi = {
  get: () => request<DashboardData>('/dashboard'),
}
