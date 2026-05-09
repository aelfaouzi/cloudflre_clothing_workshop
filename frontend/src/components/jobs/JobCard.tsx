import { AlertTriangle, Clock, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import {
  cn,
  STATUS_COLORS,
  PRIORITY_COLORS,
  getStatusKey,
  getPriorityKey,
  formatDate,
  isDelayed,
} from '@/lib/utils'
import type { JobOrder } from '@/types'

interface Props {
  job: JobOrder
  onClick?: () => void
}

export default function JobCard({ job, onClick }: Props) {
  const { t } = useTranslation('common')
  const delayed = isDelayed(job.dueDate, job.status)

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'rounded-lg border bg-card p-3 shadow-sm transition-all',
        onClick &&
          'cursor-pointer hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        delayed && 'border-red-200 bg-red-50/30',
      )}
    >
      {/* Top row: job number + badges */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-medium text-muted-foreground">
          {job.jobNumber}
        </span>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {job.priority && job.priority !== 'NORMAL' && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-xs font-medium',
                PRIORITY_COLORS[job.priority],
              )}
            >
              {t(getPriorityKey(job.priority))}
            </span>
          )}
          <Badge className={cn('border text-xs', STATUS_COLORS[job.status])}>
            {t(getStatusKey(job.status))}
          </Badge>
        </div>
      </div>

      {/* Pieces */}
      <p className="text-sm font-medium leading-tight">
        {job.piecesExpected} {t('common.pieces')}
        {job.piecesCompleted > 0 && (
          <span className="ms-1 text-muted-foreground">
            / {job.piecesCompleted} {t('common.done')}
          </span>
        )}
      </p>

      {/* Tailor */}
      {job.tailor && (
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{job.tailor.name}</span>
        </div>
      )}

      {/* Due date */}
      {job.dueDate && (
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs',
            delayed ? 'font-medium text-red-600' : 'text-muted-foreground',
          )}
        >
          {delayed ? (
            <AlertTriangle className="h-3 w-3 shrink-0" />
          ) : (
            <Clock className="h-3 w-3 shrink-0" />
          )}
          <span>{formatDate(job.dueDate)}</span>
        </div>
      )}
    </div>
  )
}
