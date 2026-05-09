import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn, STATUS_COLORS, STATUS_LABELS, STATUS_DOT_COLORS, NEXT_STATUS } from '@/lib/utils'
import JobCard from './JobCard'
import type { JobOrder, JobStatus, TransitionJobInput } from '@/types'
import { useTransitionJob } from '@/hooks/useJobs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const KANBAN_COLUMNS: JobStatus[] = ['DRAFT', 'CUTTING', 'SEWING', 'READY', 'DISPATCHED']

interface Props {
  jobs: JobOrder[]
  isLoading?: boolean
}

interface TransitionModalState {
  job: JobOrder
  targetStatus: JobStatus
}

export default function KanbanBoard({ jobs, isLoading }: Props) {
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
      <div className="grid grid-cols-5 gap-4">
        {KANBAN_COLUMNS.map((s) => (
          <div key={s} className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-2">
        {KANBAN_COLUMNS.map((status) => {
          const columnJobs = jobsByStatus[status] ?? []
          return (
            <div key={status} className="flex flex-col gap-2 min-w-[180px]">
              {/* Column header */}
              <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', STATUS_DOT_COLORS[status])} />
                  <span className="text-xs font-semibold">{STATUS_LABELS[status]}</span>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {columnJobs.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {columnJobs.length === 0 && (
                  <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Empty
                  </div>
                )}
                {columnJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={NEXT_STATUS[job.status] ? () => handleCardClick(job) : undefined}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Transition confirmation modal */}
      <Dialog open={!!transitionModal} onOpenChange={() => setTransitionModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Advance Job to {transitionModal && STATUS_LABELS[transitionModal.targetStatus]}</DialogTitle>
          </DialogHeader>
          {transitionModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Move <span className="font-medium">{transitionModal.job.jobNumber}</span> from{' '}
                <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', STATUS_COLORS[transitionModal.job.status])}>
                  {STATUS_LABELS[transitionModal.job.status]}
                </span>{' '}
                to{' '}
                <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', STATUS_COLORS[transitionModal.targetStatus])}>
                  {STATUS_LABELS[transitionModal.targetStatus]}
                </span>
              </p>

              {transitionModal.targetStatus === 'READY' && (
                <div className="space-y-2">
                  <Label>Pieces Completed</Label>
                  <Input
                    type="number"
                    min={0}
                    value={piecesCompleted}
                    onChange={(e) => setPiecesCompleted(e.target.value)}
                    placeholder={`Expected: ${transitionModal.job.piecesExpected}`}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTransitionModal(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmTransition}
                  disabled={transitionMutation.isPending}
                >
                  {transitionMutation.isPending ? 'Processing...' : 'Confirm'}
                </Button>
              </div>

              {transitionMutation.isError && (
                <p className="text-sm text-destructive">
                  {(transitionMutation.error as Error).message}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
