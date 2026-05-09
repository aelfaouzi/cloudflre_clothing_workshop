import { useState } from 'react'
import { Plus, LayoutGrid, List, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import KanbanBoard from '@/components/jobs/KanbanBoard'
import JobForm from '@/components/jobs/JobForm'
import { useJobs, useCreateJob, useDeleteJob, useTransitionJob } from '@/hooks/useJobs'
import {
  cn,
  STATUS_COLORS,
  PRIORITY_COLORS,
  getStatusKey,
  getPriorityKey,
  formatDate,
  isDelayed,
} from '@/lib/utils'
import type { JobOrder, JobStatus } from '@/types'

type ViewMode = 'kanban' | 'list'

export default function Jobs() {
  const { t } = useTranslation('common')
  const [view, setView] = useState<ViewMode>('kanban')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)

  const { data: jobs = [], isLoading } = useJobs()
  const createMutation = useCreateJob()
  const deleteMutation = useDeleteJob()
  const transitionMutation = useTransitionJob()

  const handleCreate = async (values: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(values)
    setShowCreateDialog(false)
  }

  const handleDelete = async () => {
    if (!deletingJobId) return
    await deleteMutation.mutateAsync(deletingJobId)
    setDeletingJobId(null)
  }

  const handleCancel = async (job: JobOrder) => {
    await transitionMutation.mutateAsync({ id: job.id, data: { targetStatus: 'CANCELED' } })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('jobs.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {jobs.length} {t('jobs.totalJobs')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                view === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            {t('jobs.newJob')}
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' ? (
        <KanbanBoard jobs={jobs} isLoading={isLoading} />
      ) : (
        <JobsListView
          jobs={jobs}
          isLoading={isLoading}
          onDelete={setDeletingJobId}
          onCancel={handleCancel}
        />
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('jobs.createJob')}</DialogTitle>
            <DialogDescription>{t('jobs.fillDetails')}</DialogDescription>
          </DialogHeader>
          <JobForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createMutation.isPending}
          />
          {createMutation.isError && (
            <p className="text-sm text-destructive">{(createMutation.error as Error).message}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deletingJobId} onOpenChange={() => setDeletingJobId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('jobs.deleteJob')}</DialogTitle>
            <DialogDescription>{t('jobs.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingJobId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function JobsListView({
  jobs,
  isLoading,
  onDelete,
  onCancel,
}: {
  jobs: JobOrder[]
  isLoading: boolean
  onDelete: (id: string) => void
  onCancel: (job: JobOrder) => void
}) {
  const { t } = useTranslation('common')

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('jobs.jobNumber')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead>{t('jobs.priority')}</TableHead>
            <TableHead>{t('jobs.piecesExpected')}</TableHead>
            <TableHead>{t('tailors.name')}</TableHead>
            <TableHead>{t('jobs.dueDate')}</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                {t('jobs.noJobs')}
              </TableCell>
            </TableRow>
          )}
          {jobs.map((job) => {
            const delayed = isDelayed(job.dueDate, job.status)
            const canDelete = ['DRAFT', 'CANCELED'].includes(job.status)
            const canCancel = !['DISPATCHED', 'CANCELED'].includes(job.status)
            return (
              <TableRow key={job.id} className={cn(delayed && 'bg-red-50/30')}>
                <TableCell className="font-mono text-xs">{job.jobNumber}</TableCell>
                <TableCell>
                  <Badge className={cn('border text-xs', STATUS_COLORS[job.status as JobStatus])}>
                    {t(getStatusKey(job.status as JobStatus))}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.priority && (
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', PRIORITY_COLORS[job.priority])}>
                      {t(getPriorityKey(job.priority))}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {job.piecesExpected}
                  {job.piecesCompleted > 0 && (
                    <span className="text-muted-foreground"> / {job.piecesCompleted}</span>
                  )}
                </TableCell>
                <TableCell>{job.tailor?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  <span className={cn('text-sm', delayed && 'text-red-600 font-medium')}>
                    {formatDate(job.dueDate)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {canCancel && (
                      <button
                        className="rounded p-1 text-muted-foreground hover:bg-amber-100 hover:text-amber-700"
                        title={t('jobs.cancelJob')}
                        onClick={() => onCancel(job)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="rounded p-1 text-muted-foreground hover:bg-red-100 hover:text-red-700"
                        title={t('jobs.deleteJob')}
                        onClick={() => onDelete(job.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
