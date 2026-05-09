import { AlertTriangle, Briefcase, Clock, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, STATUS_COLORS, STATUS_DOT_COLORS, getStatusKey, formatDate, isDelayed } from '@/lib/utils'
import { useDashboard } from '@/hooks/useDashboard'
import type { JobStatus } from '@/types'

const ACTIVE_STATUSES: JobStatus[] = ['DRAFT', 'CUTTING', 'SEWING', 'READY']

export default function Dashboard() {
  const { t } = useTranslation('common')
  const { data, isLoading, error } = useDashboard()

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold md:text-3xl">{t('dashboard.title')}</h1>
        <p className="text-sm text-destructive">{t('alerts.failedLoad')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">{t('dashboard.title')}</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          title={t('dashboard.activeJobs')}
          value={data?.summary.totalActiveJobs ?? 0}
          icon={<Briefcase className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          title={t('dashboard.delayedJobs')}
          value={data?.summary.delayedJobs ?? 0}
          icon={<Clock className="h-5 w-5 text-red-500" />}
          isLoading={isLoading}
          highlight={!!data && data.summary.delayedJobs > 0}
        />
        <StatCard
          title={t('dashboard.lowStockAlerts')}
          value={data?.lowStockFabrics.length ?? 0}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          isLoading={isLoading}
          highlight={!!data && data.lowStockFabrics.length > 0}
        />
        <StatCard
          title={t('dashboard.activeTailors')}
          value={data?.tailorWorkload.filter((tw) => tw.isActive).length ?? 0}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Jobs by status */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('dashboard.jobsByStage')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {ACTIVE_STATUSES.map((s) => (
                  <Skeleton key={s} className="h-10" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {ACTIVE_STATUSES.map((status) => {
                  const count = data?.summary.jobsByStatus[status] ?? 0
                  const total = data?.summary.totalActiveJobs ?? 1
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="flex w-20 shrink-0 items-center gap-2 sm:w-24">
                        <div className={cn('h-2.5 w-2.5 shrink-0 rounded-full', STATUS_DOT_COLORS[status])} />
                        <span className="truncate text-xs text-muted-foreground sm:text-sm">
                          {t(getStatusKey(status))}
                        </span>
                      </div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn('h-2 rounded-full transition-all', {
                            'bg-slate-400': status === 'DRAFT',
                            'bg-orange-400': status === 'CUTTING',
                            'bg-blue-400': status === 'SEWING',
                            'bg-green-400': status === 'READY',
                          })}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-5 shrink-0 text-end text-sm font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tailor workload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('dashboard.tailorWorkload')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-9" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {(data?.tailorWorkload ?? [])
                  .filter((tw) => tw.isActive)
                  .sort((a, b) => b.assignedJobsCount - a.assignedJobsCount)
                  .map((tailor) => (
                    <div
                      key={tailor.tailorId}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="truncate text-sm font-medium">{tailor.name}</span>
                      <Badge variant="secondary" className="ms-2 shrink-0">
                        {tailor.assignedJobsCount} {t('common.jobs')}
                      </Badge>
                    </div>
                  ))}
                {(data?.tailorWorkload ?? []).filter((tw) => tw.isActive).length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('dashboard.noActiveTailors')}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low stock alerts */}
        {((data?.lowStockFabrics.length ?? 0) > 0 || isLoading) && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                {t('dashboard.lowStockAlerts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {data?.lowStockFabrics.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between rounded-md border border-red-100 bg-red-50/50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-red-700">{f.fabricCode}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.type}{f.color ? ` • ${f.color}` : ''}
                        </p>
                      </div>
                      <div className="ms-3 shrink-0 text-end">
                        <p className="text-sm font-semibold text-red-600">{f.availableQty.toFixed(1)}m</p>
                        <p className="text-xs text-muted-foreground">
                          {t('dashboard.threshold')}: {f.lowStockThreshold}m
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent jobs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('dashboard.recentJobs')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {(data?.recentJobs ?? []).slice(0, 6).map((job) => {
                  const delayed = isDelayed(job.dueDate, job.status as JobStatus)
                  return (
                    <div
                      key={job.id}
                      className={cn(
                        'flex items-center justify-between rounded-md border px-3 py-2',
                        delayed && 'border-red-200 bg-red-50/30',
                      )}
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">{job.jobNumber}</p>
                        <p className="text-sm font-medium">
                          {job.piecesExpected} {t('common.pieces')}
                        </p>
                      </div>
                      <div className="ms-2 flex shrink-0 flex-col items-end gap-1">
                        <Badge className={cn('border text-xs', STATUS_COLORS[job.status as JobStatus])}>
                          {t(getStatusKey(job.status as JobStatus))}
                        </Badge>
                        {job.dueDate && (
                          <span
                            className={cn(
                              'text-xs',
                              delayed ? 'font-medium text-red-600' : 'text-muted-foreground',
                            )}
                          >
                            {formatDate(job.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {(data?.recentJobs ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('dashboard.noRecentJobs')}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  isLoading?: boolean
  highlight?: boolean
}

function StatCard({ title, value, icon, isLoading, highlight }: StatCardProps) {
  return (
    <Card className={cn(highlight && 'border-red-200')}>
      <CardContent className="p-3 sm:p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
            <Skeleton className="h-7 w-10 sm:h-8 sm:w-12" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{title}</p>
              <p className={cn('text-2xl font-bold sm:text-3xl', highlight && 'text-red-600')}>
                {value}
              </p>
            </div>
            <div className="shrink-0">{icon}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
