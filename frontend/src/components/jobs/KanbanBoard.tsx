import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, STATUS_COLORS, STATUS_DOT_COLORS, NEXT_STATUS, getStatusKey } from '@/lib/utils'
import JobCard from './JobCard'
import type { JobOrder, JobStatus, TransitionJobInput } from '@/types'
import { useTransitionJob } from '@/hooks/useJobs'

const KANBAN_COLUMNS: JobStatus[] = ['DRAFT', 'CUTTING', 'SEWING', 'READY', 'DISPATCHED']

interface Props {
  jobs: JobOrder[]
  isLoading?: boolean
  onEdit?: (job: JobOrder) => void
  onDelete?: (id: string) => void
}

interface TransitionModalState {
  job: JobOrder
  targetStatus: JobStatus
}

export default function KanbanBoard({ jobs, isLoading, onEdit, onDelete }: Props) {
  const { t } = useTranslation('common')
  const [transitionModal, setTransitionModal] = useState<TransitionModalState | null>(null)
  const [piecesCompleted, setPiecesCompleted] = useState('')
  const transitionMutation = useTransitionJob()

  const jobsByStatus = KANBAN_COLUMNS.reduce<Record<JobStatus, JobOrder[]>>(
    (acc, status) => {
      acc[status] = jobs.filter((j) => j.status === status)
      return acc
    },
    {} as Record<JobStatus, JobOrder[]>,
  )

  const handleCardClick = (job: JobOrder) => {
    const next = NEXT_STATUS[job.status]
    if (next) {
      setTransitionModal({ job, targetStatus: next })
      setPiecesCompleted('')
    }
  }

  const handleConfirmTransition = async () => {
    if (!transitionModal) return
    const data: TransitionJobInput = { targetStatus: transitionModal.targetStatus }
    if (piecesCompleted && transitionModal.targetStatus === 'READY') {
      data.piecesCompleted = parseInt(piecesCompleted, 10)
    }
    await transitionMutation.mutateAsync({ id: transitionModal.job.id, data })
    setTransitionModal(null)
  }

  if (isLoading) {
    return (
      /* Loading skeleton — horizontal scroll on mobile, grid on lg */
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {KANBAN_COLUMNS.map((s) => (
          <div key={s} className="w-[200px] shrink-0 space-y-3 lg:w-auto">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/*
        Mobile / tablet: flex row with horizontal scroll (each col 200px min).
        Desktop lg+: 5-column grid, no horizontal scroll.
        Negative horizontal margin cancels page padding so the scroll
        reaches the screen edges on mobile.
      */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-none pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0">
        <div className="flex gap-3 lg:grid lg:grid-cols-5">
          {KANBAN_COLUMNS.map((status) => {
            const columnJobs = jobsByStatus[status] ?? []
            return (
              <div
                key={status}
                className="flex w-[min(200px,75vw)] shrink-0 flex-col gap-2 lg:w-auto"
              >
                {/* Column header */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-2 w-2 rounded-full', STATUS_DOT_COLORS[status])} />
                    <span className="text-xs font-semibold">{t(getStatusKey(status))}</span>
                  </div>
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                    {columnJobs.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2">
                  {columnJobs.length === 0 && (
                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                      {t('common.empty')}
                    </div>
                  )}
                  {columnJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onClick={NEXT_STATUS[job.status] ? () => handleCardClick(job) : undefined}
                      onEdit={onEdit ? () => onEdit(job) : undefined}
                      onDelete={onDelete ? () => onDelete(job.id) : undefined}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transition confirmation modal */}
      <Dialog open={!!transitionModal} onOpenChange={() => setTransitionModal(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>
              {transitionModal
                ? t('jobs.advanceTo', { status: t(getStatusKey(transitionModal.targetStatus)) })
                : ''}
            </DialogTitle>
          </DialogHeader>
          {transitionModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {transitionModal.job.jobNumber}{' '}
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-xs font-medium',
                    STATUS_COLORS[transitionModal.job.status],
                  )}
                >
                  {t(getStatusKey(transitionModal.job.status))}
                </span>{' '}
                →{' '}
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-xs font-medium',
                    STATUS_COLORS[transitionModal.targetStatus],
                  )}
                >
                  {t(getStatusKey(transitionModal.targetStatus))}
                </span>
              </p>

              {transitionModal.targetStatus === 'READY' && (
                <div className="space-y-2">
                  <Label>{t('jobs.piecesCompleted')}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="min-h-[44px]"
                    value={piecesCompleted}
                    onChange={(e) => setPiecesCompleted(e.target.value)}
                    placeholder={`${t('jobs.piecesExpected')}: ${transitionModal.job.piecesExpected}`}
                  />
                </div>
              )}

              {transitionMutation.isError && (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {(transitionMutation.error as Error).message}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  className="min-h-[44px]"
                  onClick={() => setTransitionModal(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  className="min-h-[44px]"
                  onClick={handleConfirmTransition}
                  disabled={transitionMutation.isPending}
                >
                  {transitionMutation.isPending
                    ? t('common.processing')
                    : t('jobs.confirmTransition')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
