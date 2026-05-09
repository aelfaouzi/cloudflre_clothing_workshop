import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('common')

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
          <Label htmlFor="fabricCode">{t('fabrics.fabricCode')} *</Label>
          <Input id="fabricCode" {...register('fabricCode')} placeholder={t('fabrics.fabricCodePlaceholder')} />
          {errors.fabricCode && <p className="text-xs text-destructive">{t('validation.required')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t('fabrics.type')} *</Label>
          <Input id="type" {...register('type')} placeholder={t('fabrics.typePlaceholder')} />
          {errors.type && <p className="text-xs text-destructive">{t('validation.required')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">{t('fabrics.color')}</Label>
          <Input id="color" {...register('color')} placeholder={t('fabrics.colorPlaceholder')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">{t('fabrics.supplier')}</Label>
          <Input id="supplier" {...register('supplier')} placeholder={t('fabrics.supplierPlaceholder')} />
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="initialQty">{t('fabrics.initialQty')} *</Label>
            <Input
              id="initialQty"
              type="number"
              step="0.01"
              {...register('initialQty')}
            />
            {errors.initialQty && (
              <p className="text-xs text-destructive">{t('validation.minValue', { min: 0 })}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="costPerMeter">{t('fabrics.costPerMeter')}</Label>
          <Input
            id="costPerMeter"
            type="number"
            step="0.01"
            {...register('costPerMeter')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">{t('fabrics.lowStockThreshold')}</Label>
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
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('common.saving') : isEdit ? t('common.update') : t('fabrics.addFabric')}
        </Button>
      </div>
    </form>
  )
}
