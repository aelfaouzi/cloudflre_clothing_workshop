import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Tailor } from '@/types'

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  paymentType: z.enum(['per_piece', 'per_week']),
  payRatePerPiece: z.coerce.number().min(0).optional(),
  payRatePerWeek: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Tailor>
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  isLoading?: boolean
  isEdit?: boolean
}

export default function TailorForm({ defaultValues, onSubmit, onCancel, isLoading, isEdit }: Props) {
  const { t } = useTranslation('common')

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      paymentType: defaultValues?.paymentType ?? 'per_piece',
      payRatePerPiece: defaultValues?.payRatePerPiece ?? 0,
      payRatePerWeek: defaultValues?.payRatePerWeek ?? 0,
      isActive: defaultValues?.isActive ?? true,
    },
  })

  const paymentType = watch('paymentType')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">{t('tailors.name')} *</Label>
          <Input
            id="name"
            className="min-h-[44px]"
            placeholder={t('tailors.namePlaceholder')}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{t('validation.required')}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t('tailors.phone')}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            className="min-h-[44px]"
            placeholder={t('tailors.phonePlaceholder')}
            {...register('phone')}
          />
        </div>

        {/* Payment type */}
        <div className="space-y-2">
          <Label>{t('tailors.paymentType')}</Label>
          <Controller
            name="paymentType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_piece">{t('tailors.perPiece')}</SelectItem>
                  <SelectItem value="per_week">{t('tailors.perWeek')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Pay rate — conditional on payment type */}
        {paymentType === 'per_piece' ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="payRatePerPiece">{t('tailors.payRatePerPiece')}</Label>
            <Input
              id="payRatePerPiece"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              className="min-h-[44px]"
              {...register('payRatePerPiece')}
            />
          </div>
        ) : (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="payRatePerWeek">{t('tailors.payRatePerWeek')}</Label>
            <Input
              id="payRatePerWeek"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              className="min-h-[44px]"
              {...register('payRatePerWeek')}
            />
          </div>
        )}

        {/* Status — edit only */}
        {isEdit && (
          <div className="space-y-2 sm:col-span-2">
            <Label>{t('common.status')}</Label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? 'active' : 'inactive'}
                  onValueChange={(v) => field.onChange(v === 'active')}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('common.active')}</SelectItem>
                    <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="min-h-[44px]" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="min-h-[44px]" disabled={isLoading}>
          {isLoading ? t('common.saving') : isEdit ? t('tailors.editTailor') : t('tailors.addTailor')}
        </Button>
      </div>
    </form>
  )
}
