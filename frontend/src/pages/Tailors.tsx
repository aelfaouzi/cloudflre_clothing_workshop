import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
import TailorForm from '@/components/tailors/TailorForm'
import { useTailors, useCreateTailor, useUpdateTailor, useDeleteTailor } from '@/hooks/useTailors'
import { cn } from '@/lib/utils'
import type { Tailor } from '@/types'

export default function Tailors() {
  const { t } = useTranslation('common')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTailor, setEditingTailor] = useState<Tailor | null>(null)
  const [deletingTailorId, setDeletingTailorId] = useState<string | null>(null)

  const { data: tailors = [], isLoading } = useTailors()
  const createMutation = useCreateTailor()
  const updateMutation = useUpdateTailor()
  const deleteMutation = useDeleteTailor()

  const handleCreate = async (values: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(values)
    setShowCreateDialog(false)
  }

  const handleUpdate = async (values: Parameters<typeof updateMutation.mutateAsync>[0]['data']) => {
    if (!editingTailor) return
    await updateMutation.mutateAsync({ id: editingTailor.id, data: values })
    setEditingTailor(null)
  }

  const handleDelete = async () => {
    if (!deletingTailorId) return
    await deleteMutation.mutateAsync(deletingTailorId)
    setDeletingTailorId(null)
  }

  const activeTailors = tailors.filter((t) => t.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('tailors.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('tailors.totalActive', { active: activeTailors })}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          {t('tailors.addTailor')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tailors.name')}</TableHead>
                <TableHead>{t('tailors.phone')}</TableHead>
                <TableHead>{t('tailors.payRatePerPiece')}</TableHead>
                <TableHead>{t('tailors.activeJobs')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tailors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t('tailors.noTailors')}
                  </TableCell>
                </TableRow>
              )}
              {tailors.map((tailor) => (
                <TableRow key={tailor.id} className={cn(!tailor.isActive && 'opacity-60')}>
                  <TableCell className="font-medium">{tailor.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tailor.phone ?? '—'}
                  </TableCell>
                  <TableCell>
                    {tailor.payRatePerPiece
                      ? `$${tailor.payRatePerPiece.toFixed(2)}/pc`
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {tailor.assignedJobsCount} {t('common.jobs')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tailor.isActive ? 'default' : 'secondary'}
                      className={cn(
                        tailor.isActive
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {tailor.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => setEditingTailor(tailor)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="rounded p-1 text-muted-foreground hover:bg-red-100 hover:text-red-700"
                        onClick={() => setDeletingTailorId(tailor.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('tailors.addTailor')}</DialogTitle>
            <DialogDescription>{t('tailors.registerDescription')}</DialogDescription>
          </DialogHeader>
          <TailorForm
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
      <Dialog open={!!editingTailor} onOpenChange={() => setEditingTailor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('tailors.editTailor')}</DialogTitle>
          </DialogHeader>
          {editingTailor && (
            <>
              <TailorForm
                defaultValues={editingTailor}
                onSubmit={handleUpdate}
                onCancel={() => setEditingTailor(null)}
                isLoading={updateMutation.isPending}
                isEdit
              />
              {updateMutation.isError && (
                <p className="text-sm text-destructive">{(updateMutation.error as Error).message}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deletingTailorId} onOpenChange={() => setDeletingTailorId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('tailors.deleteTailor')}</DialogTitle>
            <DialogDescription>{t('tailors.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingTailorId(null)}>
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
