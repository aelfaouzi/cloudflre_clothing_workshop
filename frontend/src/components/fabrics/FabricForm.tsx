import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Fabric } from '@/types'

const schema = z.object({
  fabricCode: z.string().min(1, 'Required'),
  type: z.string().min(1, 'Required'),
  color: z.string().optional(),
  supplier: z.string().optional(),
  initialQty: z.coerce.number().min(0, 'Must be ≥ 0'),
  costPerMeter: z.coerce.number().min(0).optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Fabric>
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  isLoading?: boolean
  isEdit?: boolean
}

export default function FabricForm({ defaultValues, onSubmit, onCancel, isLoading, isEdit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fabricCode: defaultValues?.fabricCode ?? '',
      type: defaultValues?.type ?? '',
      color: defaultValues?.color ?? '',
      supplier: defaultValues?.supplier ?? '',
      initialQty: defaultValues?.initialQty ?? 0,
      costPerMeter: defaultValues?.costPerMeter ?? 0,
      lowStockThreshold: defaultValues?.lowStockThreshold ?? 5,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fabricCode">Fabric Code *</Label>
          <Input id="fabricCode" {...register('fabricCode')} placeholder="FAB-001" />
          {errors.fabricCode && <p className="text-xs text-destructive">{errors.fabricCode.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Input id="type" {...register('type')} placeholder="Cotton, Polyester..." />
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input id="color" {...register('color')} placeholder="White, Blue..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input id="supplier" {...register('supplier')} placeholder="Supplier name" />
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="initialQty">Initial Quantity (m) *</Label>
            <Input
              id="initialQty"
              type="number"
              step="0.01"
              {...register('initialQty')}
            />
            {errors.initialQty && (
              <p className="text-xs text-destructive">{errors.initialQty.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="costPerMeter">Cost per Meter</Label>
          <Input
            id="costPerMeter"
            type="number"
            step="0.01"
            {...register('costPerMeter')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">Low Stock Alert (m)</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            step="0.1"
            {...register('lowStockThreshold')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update Fabric' : 'Add Fabric'}
        </Button>
      </div>
    </form>
  )
}
