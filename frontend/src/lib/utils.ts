import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { JobStatus, Priority } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  CUTTING: 'Cutting',
  SEWING: 'Sewing',
  READY: 'Ready',
  DISPATCHED: 'Dispatched',
  CANCELED: 'Canceled',
}

export const STATUS_COLORS: Record<JobStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  CUTTING: 'bg-orange-100 text-orange-700 border-orange-200',
  SEWING: 'bg-blue-100 text-blue-700 border-blue-200',
  READY: 'bg-green-100 text-green-700 border-green-200',
  DISPATCHED: 'bg-purple-100 text-purple-700 border-purple-200',
  CANCELED: 'bg-red-100 text-red-700 border-red-200',
}

export const STATUS_DOT_COLORS: Record<JobStatus, string> = {
  DRAFT: 'bg-slate-400',
  CUTTING: 'bg-orange-400',
  SEWING: 'bg-blue-400',
  READY: 'bg-green-400',
  DISPATCHED: 'bg-purple-400',
  CANCELED: 'bg-red-400',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  NORMAL: 'bg-blue-50 text-blue-600',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
}

export const NEXT_STATUS: Record<JobStatus, JobStatus | null> = {
  DRAFT: 'CUTTING',
  CUTTING: 'SEWING',
  SEWING: 'READY',
  READY: 'DISPATCHED',
  DISPATCHED: null,
  CANCELED: null,
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(dateStr),
  )
}

export function isDelayed(dueDate: string | null, status: JobStatus): boolean {
  if (!dueDate || ['DISPATCHED', 'CANCELED'].includes(status)) return false
  return new Date(dueDate) < new Date()
}
