import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  piecesExpected: z.coerce.number().int().min(1),
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
  const { t } = useTranslation('common')
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

  const addFabricLink = () =>
    setFabricLinks((prev) => [...prev, { fabricId: '', metersReserved: 0 }])

  const removeFabricLink = (index: number) =>
    setFabricLinks((prev) => prev.filter((_, i) => i !== index))

  const updateFabricLink = (
    index: number,
    field: keyof FabricLinkInput,
    value: string | number,
  ) =>
    setFabricLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    )

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Row 1: Tailor + Priority */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('jobs.assignTailor')}</Label>
          <Select
            value={watch('tailorId') ?? ''}
            onValueChange={(v) => setValue('tailorId', v || undefined)}
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder={t('jobs.selectTailor')} />
            </SelectTrigger>
            <SelectContent>
              {activeTailors.map((tailor) => (
                <SelectItem key={tailor.id} value={tailor.id}>
                  {tailor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('jobs.priority')}</Label>
          <Select
            value={watch('priority')}
            onValueChange={(v) => setValue('priority', v as FormValues['priority'])}
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{t('priority.low')}</SelectItem>
              <SelectItem value="NORMAL">{t('priority.normal')}</SelectItem>
              <SelectItem value="HIGH">{t('priority.high')}</SelectItem>
              <SelectItem value="URGENT">{t('priority.urgent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Pieces + Due Date */}
        <div className="space-y-2">
          <Label htmlFor="piecesExpected">{t('jobs.piecesExpectedLabel')}</Label>
          <Input
            id="piecesExpected"
            type="number"
            inputMode="numeric"
            min={1}
            className="min-h-[44px]"
            {...register('piecesExpected')}
          />
          {errors.piecesExpected && (
            <p className="text-xs text-destructive">{t('validation.atLeastOne')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">{t('jobs.dueDate')}</Label>
          <Input
            id="dueDate"
            type="date"
            className="min-h-[44px]"
            {...register('dueDate')}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">{t('jobs.notes')}</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder={t('jobs.notesPlaceholder')}
          {...register('notes')}
        />
      </div>

      {/* Fabric links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('jobs.fabricAssignments')}</Label>
          <Button type="button" variant="outline" size="sm" onClick={addFabricLink}>
            <Plus className="h-3.5 w-3.5" />
            {t('jobs.addFabric')}
          </Button>
        </div>

        {fabricLinks.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('jobs.noFabricsAssigned')}</p>
        )}

        <div className="space-y-2">
          {fabricLinks.map((link, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  value={link.fabricId}
                  onValueChange={(v) => updateFabricLink(index, 'fabricId', v)}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder={t('jobs.selectFabric')} />
                  </SelectTrigger>
                  <SelectContent>
                    {fabrics.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.fabricCode} — {f.type} (
                        {(f.currentQty - f.reservedQty).toFixed(1)}m {t('jobs.available')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 shrink-0">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0}
                  className="min-h-[44px]"
                  placeholder={t('jobs.meters')}
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
                className="h-11 w-11 shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeFabricLink(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
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
              ? t('common.update')
              : t('common.create')}
        </Button>
      </div>
    </form>
  )
}
