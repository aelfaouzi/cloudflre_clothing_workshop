import { useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
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
import FabricForm from '@/components/fabrics/FabricForm'
import { useFabrics, useCreateFabric, useUpdateFabric, useDeleteFabric } from '@/hooks/useFabrics'
import { cn } from '@/lib/utils'
import type { Fabric } from '@/types'

export default function Fabrics() {
  const { t } = useTranslation('common')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null)
  const [deletingFabricId, setDeletingFabricId] = useState<string | null>(null)

  const { data: fabrics = [], isLoading } = useFabrics()
  const createMutation = useCreateFabric()
  const updateMutation = useUpdateFabric()
  const deleteMutation = useDeleteFabric()

  const handleCreate = async (values: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(values)
    setShowCreateDialog(false)
  }

  const handleUpdate = async (values: Parameters<typeof updateMutation.mutateAsync>[0]['data']) => {
    if (!editingFabric) return
    await updateMutation.mutateAsync({ id: editingFabric.id, data: values })
    setEditingFabric(null)
  }

  const handleDelete = async () => {
    if (!deletingFabricId) return
    await deleteMutation.mutateAsync(deletingFabricId)
    setDeletingFabricId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t('fabrics.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {fabrics.length} {t('fabrics.inInventory')}
          </p>
        </div>
        <Button className="min-h-[44px] sm:w-auto" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          {t('fabrics.addFabric')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : fabrics.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t('fabrics.noFabrics')}
        </p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-2 md:hidden">
            {fabrics.map((fabric) => {
              const available = fabric.currentQty - fabric.reservedQty
              const isLow = fabric.currentQty < (fabric.lowStockThreshold ?? 5)
              return (
                <div
                  key={fabric.id}
                  className={cn(
                    'rounded-lg border bg-card p-3',
                    isLow && 'border-red-200 bg-red-50/30',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {isLow && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                        <span className="font-mono text-sm font-semibold">{fabric.fabricCode}</span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {fabric.type}{fabric.color ? ` • ${fabric.color}` : ''}
                      </p>
                      {fabric.supplier && (
                        <p className="truncate text-xs text-muted-foreground">{fabric.supplier}</p>
                      )}
                    </div>
                    <div className="ms-3 shrink-0 text-end">
                      <p className={cn('text-sm font-semibold', isLow ? 'text-red-600' : 'text-foreground')}>
                        {available.toFixed(1)}m
                      </p>
                      <p className="text-xs text-muted-foreground">{t('fabrics.available')}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t('fabrics.reservedQty')}: {fabric.reservedQty.toFixed(1)}m
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end gap-1 border-t pt-2">
                    <button
                      className="min-h-[36px] rounded px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => setEditingFabric(fabric)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="min-h-[36px] rounded px-2 text-muted-foreground hover:bg-red-100 hover:text-red-700"
                      onClick={() => setDeletingFabricId(fabric.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fabrics.fabricCode')}</TableHead>
                  <TableHead>{t('fabrics.type')}</TableHead>
                  <TableHead>{t('fabrics.color')}</TableHead>
                  <TableHead>{t('fabrics.supplier')}</TableHead>
                  <TableHead className="text-end">{t('fabrics.availableQty')}</TableHead>
                  <TableHead className="text-end">{t('fabrics.reservedQty')}</TableHead>
                  <TableHead className="text-end">{t('fabrics.currentQty')}</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fabrics.map((fabric) => {
                  const available = fabric.currentQty - fabric.reservedQty
                  const isLow = fabric.currentQty < (fabric.lowStockThreshold ?? 5)
                  return (
                    <TableRow key={fabric.id} className={cn(isLow && 'bg-red-50/30')}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                          <span className="font-mono text-sm font-medium">{fabric.fabricCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>{fabric.type}</TableCell>
                      <TableCell>
                        {fabric.color ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {fabric.supplier ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className={cn('text-end font-medium', isLow && 'text-red-600')}>
                        {available.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-end text-muted-foreground">
                        {fabric.reservedQty.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-end">{fabric.currentQty.toFixed(1)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <button
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => setEditingFabric(fabric)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="rounded p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-700"
                            onClick={() => setDeletingFabricId(fabric.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>{t('fabrics.addFabric')}</DialogTitle>
            <DialogDescription>{t('fabrics.addDescription')}</DialogDescription>
          </DialogHeader>
          <FabricForm
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
      <Dialog open={!!editingFabric} onOpenChange={() => setEditingFabric(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>{t('fabrics.editFabric')}</DialogTitle>
          </DialogHeader>
          {editingFabric && (
            <>
              <FabricForm
                defaultValues={editingFabric}
                onSubmit={handleUpdate}
                onCancel={() => setEditingFabric(null)}
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
      <Dialog open={!!deletingFabricId} onOpenChange={() => setDeletingFabricId(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>{t('fabrics.deleteFabric')}</DialogTitle>
            <DialogDescription>{t('fabrics.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="min-h-[44px]" onClick={() => setDeletingFabricId(null)}>
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
