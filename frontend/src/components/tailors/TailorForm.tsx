import { useForm } from 'react-hook-form'
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
  name: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  payRatePerPiece: z.coerce.number().min(0).optional(),
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      payRatePerPiece: defaultValues?.payRatePerPiece ?? 0,
      isActive: defaultValues?.isActive ?? true,
    },
  })

  const isActive = watch('isActive')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">{t('tailors.name')} *</Label>
          <Input id="name" {...register('name')} placeholder={t('tailors.namePlaceholder')} />
          {errors.name && <p className="text-xs text-destructive">{t('validation.required')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('tailors.phone')}</Label>
          <Input id="phone" {...register('phone')} placeholder={t('tailors.phonePlaceholder')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payRatePerPiece">{t('tailors.payRatePerPiece')}</Label>
          <Input
            id="payRatePerPiece"
            type="number"
            step="0.01"
            {...register('payRatePerPiece')}
          />
        </div>

        {isEdit && (
          <div className="space-y-2">
            <Label>{t('common.status')}</Label>
            <Select
              value={isActive ? 'active' : 'inactive'}
              onValueChange={(v) => setValue('isActive', v === 'active')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('common.saving') : isEdit ? t('common.update') : t('tailors.addTailor')}
        </Button>
      </div>
    </form>
  )
}
