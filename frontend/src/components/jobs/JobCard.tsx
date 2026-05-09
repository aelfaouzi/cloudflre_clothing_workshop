import { AlertTriangle, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, formatDate, isDelayed } from '@/lib/utils'
import type { JobOrder } from '@/types'

interface Props {
  job: JobOrder
  onClick?: () => void
}

export default function JobCard({ job, onClick }: Props) {
  const delayed = isDelayed(job.dueDate, job.status)

  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-card p-3 shadow-sm transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        delayed && 'border-red-200 bg-red-50/30',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xs font-mono font-medium text-muted-foreground">{job.jobNumber}</span>
        <div className="flex gap-1">
          {job.priority && job.priority !== 'NORMAL' && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-xs font-medium',
                PRIORITY_COLORS[job.priority],
              )}
            >
              {job.priority}
            </span>
          )}
          <Badge className={cn('border text-xs', STATUS_COLORS[job.status])}>
            {STATUS_LABELS[job.status]}
          </Badge>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium leading-tight">
          {job.piecesExpected} pcs
          {job.piecesCompleted > 0 && (
            <span className="ml-1 text-muted-foreground">/ {job.piecesCompleted} done</span>
          )}
        </p>

        {job.tailor && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{job.tailor.name}</span>
          </div>
        )}

        {job.dueDate && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              delayed ? 'text-red-600 font-medium' : 'text-muted-foreground',
            )}
          >
            {delayed ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>{formatDate(job.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
