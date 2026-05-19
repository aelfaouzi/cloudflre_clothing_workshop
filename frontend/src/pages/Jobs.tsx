import { useState } from 'react'
import { Plus, LayoutGrid, List, Trash2, X, Pencil } from 'lucide-react'
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
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob, useTransitionJob } from '@/hooks/useJobs'
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
  const [editingJob, setEditingJob] = useState<JobOrder | null>(null)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)

  const { data: jobs = [], isLoading } = useJobs()
  const createMutation = useCreateJob()
  const updateMutation = useUpdateJob()
  const deleteMutation = useDeleteJob()
  const transitionMutation = useTransitionJob()

  const handleCreate = async (values: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(values)
    setShowCreateDialog(false)
  }

  const handleUpdate = async (values: Parameters<typeof updateMutation.mutateAsync>[0]['data']) => {
    if (!editingJob) return
    await updateMutation.mutateAsync({ id: editingJob.id, data: values })
    setEditingJob(null)
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t('jobs.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {jobs.length} {t('jobs.totalJobs')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-md border">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-sm transition-colors',
                view === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
              aria-label="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-sm transition-colors',
                view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button className="min-h-[44px]" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            <span>{t('jobs.newJob')}</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' ? (
        <KanbanBoard jobs={jobs} isLoading={isLoading} onEdit={setEditingJob} onDelete={setDeletingJobId} />
      ) : (
        <JobsListView
          jobs={jobs}
          isLoading={isLoading}
          onEdit={setEditingJob}
          onDelete={setDeletingJobId}
          onCancel={handleCancel}
        />
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl rounded-xl sm:w-full">
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

      {/* Edit dialog */}
      <Dialog open={!!editingJob} onOpenChange={(open) => { if (!open) setEditingJob(null) }}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>{t('jobs.editJob')}</DialogTitle>
            <DialogDescription>{t('jobs.editDetails')}</DialogDescription>
          </DialogHeader>
          {editingJob && (
            <JobForm
              defaultValues={editingJob}
              onSubmit={handleUpdate}
              onCancel={() => setEditingJob(null)}
              isLoading={updateMutation.isPending}
              isEdit
            />
          )}
          {updateMutation.isError && (
            <p className="text-sm text-destructive">{(updateMutation.error as Error).message}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deletingJobId} onOpenChange={() => setDeletingJobId(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>{t('jobs.deleteJob')}</DialogTitle>
            <DialogDescription>{t('jobs.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="min-h-[44px]" onClick={() => setDeletingJobId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              className="min-h-[44px]"
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
  onEdit,
  onDelete,
  onCancel,
}: {
  jobs: JobOrder[]
  isLoading: boolean
  onEdit: (job: JobOrder) => void
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

  if (jobs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {t('jobs.noJobs')}
      </p>
    )
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="space-y-2 md:hidden">
        {jobs.map((job) => {
          const delayed = isDelayed(job.dueDate, job.status)
          const canEdit = job.status === 'DRAFT'
          const canCancel = !['DISPATCHED', 'CANCELED'].includes(job.status)
          const canDelete = ['DRAFT', 'CANCELED'].includes(job.status)
          return (
            <div
              key={job.id}
              className={cn(
                'rounded-lg border bg-card p-3',
                delayed && 'border-red-200 bg-red-50/30',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{job.jobNumber}</p>
                  <p className="text-sm font-medium">
                    {job.piecesExpected} {t('common.pieces')}
                    {job.piecesCompleted > 0 && (
                      <span className="ms-1 text-muted-foreground">
                        / {job.piecesCompleted} {t('common.done')}
                      </span>
                    )}
                  </p>
                  {job.tailor && (
                    <p className="truncate text-xs text-muted-foreground">{job.tailor.name}</p>
                  )}
                  {job.dueDate && (
                    <p className={cn('text-xs', delayed ? 'font-medium text-red-600' : 'text-muted-foreground')}>
                      {formatDate(job.dueDate)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge className={cn('border text-xs', STATUS_COLORS[job.status as JobStatus])}>
                    {t(getStatusKey(job.status as JobStatus))}
                  </Badge>
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
                </div>
              </div>
              {(canEdit || canCancel || canDelete) && (
                <div className="mt-2 flex justify-end gap-1 border-t pt-2">
                  {canEdit && (
                    <button
                      className="flex min-h-[36px] items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => onEdit(job)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t('common.edit')}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      className="flex min-h-[36px] items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:bg-amber-100 hover:text-amber-700"
                      onClick={() => onCancel(job)}
                    >
                      <X className="h-3.5 w-3.5" />
                      {t('jobs.cancelJob')}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="flex min-h-[36px] items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:bg-red-100 hover:text-red-700"
                      onClick={() => onDelete(job.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('jobs.jobNumber')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead>{t('jobs.priority')}</TableHead>
              <TableHead>{t('jobs.piecesExpected')}</TableHead>
              <TableHead>{t('tailors.name')}</TableHead>
              <TableHead>{t('jobs.dueDate')}</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const delayed = isDelayed(job.dueDate, job.status)
              const canEdit = job.status === 'DRAFT'
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
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          PRIORITY_COLORS[job.priority],
                        )}
                      >
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
                  <TableCell>
                    {job.tailor?.name ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-sm', delayed && 'font-medium text-red-600')}>
                      {formatDate(job.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {canEdit && (
                        <button
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title={t('common.edit')}
                          onClick={() => onEdit(job)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canCancel && (
                        <button
                          className="rounded p-1.5 text-muted-foreground hover:bg-amber-100 hover:text-amber-700"
                          title={t('jobs.cancelJob')}
                          onClick={() => onCancel(job)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="rounded p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-700"
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
    </>
  )
}
