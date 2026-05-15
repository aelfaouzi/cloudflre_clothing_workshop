import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, X, Layers, Paintbrush2, Users, Briefcase, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'onboarding_dismissed'
const DONE_KEY    = 'onboarding_steps_done'

interface StepDef {
  id: string
  Icon: LucideIcon
  title: string
  description: string
  to: string
}

const STEPS: StepDef[] = [
  {
    id: 'fabric',
    Icon: Layers,
    title: 'Add your first Fabric roll',
    description: 'Register the raw material — type, color, and available quantity — so your tailors know what to cut.',
    to: '/fabrics',
  },
  {
    id: 'design',
    Icon: Paintbrush2,
    title: 'Create a Design',
    description: 'Define the blueprint: the style, expected piece count, and which fabric it requires.',
    to: '/jobs',
  },
  {
    id: 'tailor',
    Icon: Users,
    title: 'Add a Tailor',
    description: 'Register the workforce who will carry out your production orders.',
    to: '/tailors',
  },
  {
    id: 'job',
    Icon: Briefcase,
    title: 'Start a Job',
    description: 'Assign a design to a tailor, set a due date, and track every production stage — cutting → sewing → ready.',
    to: '/jobs',
  },
]

interface Props {
  /** Pass live counts so steps auto-complete without user interaction */
  tailorCount?: number
  jobCount?: number
}

function readStoredDone(): string[] {
  try { return JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]') } catch { return [] }
}

export default function OnboardingChecklist({ tailorCount = 0, jobCount = 0 }: Props) {
  const navigate = useNavigate()

  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === 'true')
  const [storedDone, setStoredDone] = useState<string[]>(readStoredDone)

  const isDone = (id: string) => {
    if (id === 'tailor') return tailorCount > 0
    if (id === 'job')    return jobCount > 0
    return storedDone.includes(id)
  }

  const doneCount = STEPS.filter((s) => isDone(s.id)).length
  const allDone   = doneCount === STEPS.length

  if (dismissed || allDone) return null

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }

  const handleStep = (step: StepDef) => {
    if (!isDone(step.id) && step.id !== 'tailor' && step.id !== 'job') {
      const next = [...storedDone, step.id]
      setStoredDone(next)
      localStorage.setItem(DONE_KEY, JSON.stringify(next))
    }
    navigate(step.to)
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Get started with Workshop</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {doneCount} of {STEPS.length} steps complete
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {STEPS.map((step, i) => {
          const done = isDone(step.id)
          const StepIcon = step.Icon
          return (
            <button
              key={step.id}
              onClick={() => handleStep(step)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-start transition-colors hover:bg-muted/50 active:scale-[0.99]',
                done && 'opacity-60',
              )}
            >
              {done
                ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                : <StepIcon    className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              }

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </p>
                <p className={cn('text-sm font-semibold', done && 'line-through decoration-muted-foreground')}>
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>

              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
