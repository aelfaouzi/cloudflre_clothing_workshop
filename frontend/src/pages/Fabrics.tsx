import { useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
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
import FabricForm from '@/components/fabrics/FabricForm'
import { useFabrics, useCreateFabric, useUpdateFabric, useDeleteFabric } from '@/hooks/useFabrics'
import { cn } from '@/lib/utils'
import type { Fabric } from '@/types'

export default function Fabrics() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fabrics</h1>
          <p className="text-sm text-muted-foreground">{fabrics.length} fabric(s) in inventory</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Fabric
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
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Available (m)</TableHead>
                <TableHead className="text-right">Reserved (m)</TableHead>
                <TableHead className="text-right">Current (m)</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fabrics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No fabrics yet. Add your first fabric.
                  </TableCell>
                </TableRow>
              )}
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
                    <TableCell>{fabric.color ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{fabric.supplier ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className={cn('text-right font-medium', isLow && 'text-red-600')}>
                      {available.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {fabric.reservedQty.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">{fabric.currentQty.toFixed(1)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => setEditingFabric(fabric)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="rounded p-1 text-muted-foreground hover:bg-red-100 hover:text-red-700"
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
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Fabric</DialogTitle>
            <DialogDescription>Add a new fabric to your inventory.</DialogDescription>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Fabric</DialogTitle>
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Fabric</DialogTitle>
            <DialogDescription>
              This will permanently delete this fabric. Jobs linked to it will be affected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingFabricId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
