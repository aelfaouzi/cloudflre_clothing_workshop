import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFabrics } from '@/hooks/useFabrics'
import { useTailors } from '@/hooks/useTailors'
import type { JobOrder, FabricLinkInput } from '@/types'

const schema = z.object({
  tailorId: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  piecesExpected: z.coerce.number().int().min(1, 'Must be at least 1'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<JobOrder>
  onSubmit: (values: FormValues & { fabricLinks: FabricLinkInput[] }) => void
  onCancel: () => void
  isLoading?: boolean
  isEdit?: boolean
}

export default function JobForm({ defaultValues, onSubmit, onCancel, isLoading, isEdit }: Props) {
  const { data: fabrics = [] } = useFabrics()
  const { data: tailors = [] } = useTailors()
  const activeTailors = tailors.filter((t) => t.isActive)

  const [fabricLinks, setFabricLinks] = useState<FabricLinkInput[]>(
    defaultValues?.fabricLinks?.map((l) => ({
      fabricId: l.fabricId,
      metersReserved: l.metersReserved,
    })) ?? [],
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tailorId: defaultValues?.tailorId ?? undefined,
      priority: (defaultValues?.priority as FormValues['priority']) ?? 'NORMAL',
      piecesExpected: defaultValues?.piecesExpected ?? 1,
      dueDate: defaultValues?.dueDate ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({ ...values, fabricLinks })
  }

  const addFabricLink = () => {
    setFabricLinks((prev) => [...prev, { fabricId: '', metersReserved: 0 }])
  }

  const removeFabricLink = (index: number) => {
    setFabricLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFabricLink = (index: number, field: keyof FabricLinkInput, value: string | number) => {
    setFabricLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Assign Tailor</Label>
          <Select
            value={watch('tailorId') ?? ''}
            onValueChange={(v) => setValue('tailorId', v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tailor..." />
            </SelectTrigger>
            <SelectContent>
              {activeTailors.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={watch('priority')}
            onValueChange={(v) => setValue('priority', v as FormValues['priority'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="piecesExpected">Pieces Expected *</Label>
          <Input id="piecesExpected" type="number" min={1} {...register('piecesExpected')} />
          {errors.piecesExpected && (
            <p className="text-xs text-destructive">{errors.piecesExpected.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} placeholder="Any additional notes..." rows={2} />
      </div>

      {/* Fabric Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Fabric Assignments</Label>
          <Button type="button" variant="outline" size="sm" onClick={addFabricLink}>
            <Plus className="h-3.5 w-3.5" />
            Add Fabric
          </Button>
        </div>

        {fabricLinks.length === 0 && (
          <p className="text-sm text-muted-foreground">No fabrics assigned yet.</p>
        )}

        {fabricLinks.map((link, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Select
                value={link.fabricId}
                onValueChange={(v) => updateFabricLink(index, 'fabricId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fabric..." />
                </SelectTrigger>
                <SelectContent>
                  {fabrics.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.fabricCode} — {f.type} ({(f.currentQty - f.reservedQty).toFixed(1)}m available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28 space-y-1">
              <Input
                type="number"
                step="0.1"
                min={0}
                placeholder="Meters"
                value={link.metersReserved}
                onChange={(e) =>
                  updateFabricLink(index, 'metersReserved', parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => removeFabricLink(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  )
}
