import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: number | string
  icon: React.ReactNode
  isLoading?: boolean
  highlight?: boolean
  description?: string
}

export default function StatsCard({ title, value, icon, isLoading, highlight, description }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-14" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(highlight && 'border-red-200')}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground md:text-sm">{title}</p>
            <p
              className={cn(
                'mt-1 text-2xl font-bold tabular-nums md:text-3xl',
                highlight && 'text-red-600',
              )}
            >
              {value}
            </p>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              highlight ? 'bg-red-50 text-red-500' : 'bg-muted',
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
