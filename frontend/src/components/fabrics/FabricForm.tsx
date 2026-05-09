import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Fabric } from '@/types'

const schema = z.object({
  fabricCode: z.string().min(1),
  type: z.string().min(1),
  color: z.string().optional(),
  supplier: z.string().optional(),
  initialQty: z.coerce.number().min(0),
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

export default function FabricForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  isEdit,
}: Props) {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Fabric code */}
        <div className="space-y-2">
          <Label htmlFor="fabricCode">{t('fabrics.fabricCode')} *</Label>
          <Input
            id="fabricCode"
            className="min-h-[44px]"
            placeholder={t('fabrics.fabricCodePlaceholder')}
            {...register('fabricCode')}
          />
          {errors.fabricCode && (
            <p className="text-xs text-destructive">{t('validation.required')}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">{t('fabrics.type')} *</Label>
          <Input
            id="type"
            className="min-h-[44px]"
            placeholder={t('fabrics.typePlaceholder')}
            {...register('type')}
          />
          {errors.type && (
            <p className="text-xs text-destructive">{t('validation.required')}</p>
          )}
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor="color">{t('fabrics.color')}</Label>
          <Input
            id="color"
            className="min-h-[44px]"
            placeholder={t('fabrics.colorPlaceholder')}
            {...register('color')}
          />
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplier">{t('fabrics.supplier')}</Label>
          <Input
            id="supplier"
            className="min-h-[44px]"
            placeholder={t('fabrics.supplierPlaceholder')}
            {...register('supplier')}
          />
        </div>

        {/* Initial qty — only on create */}
        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="initialQty">{t('fabrics.initialQty')} *</Label>
            <Input
              id="initialQty"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              className="min-h-[44px]"
              {...register('initialQty')}
            />
            {errors.initialQty && (
              <p className="text-xs text-destructive">{t('validation.required')}</p>
            )}
          </div>
        )}

        {/* Cost per meter */}
        <div className="space-y-2">
          <Label htmlFor="costPerMeter">{t('fabrics.costPerMeter')}</Label>
          <Input
            id="costPerMeter"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            className="min-h-[44px]"
            {...register('costPerMeter')}
          />
        </div>

        {/* Low stock threshold */}
        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">{t('fabrics.lowStockThreshold')}</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            className="min-h-[44px]"
            {...register('lowStockThreshold')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-[44px]"
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="min-h-[44px]" disabled={isLoading}>
          {isLoading
            ? t('common.saving')
            : isEdit
              ? t('fabrics.editFabric')
              : t('fabrics.addFabric')}
        </Button>
      </div>
    </form>
  )
}
