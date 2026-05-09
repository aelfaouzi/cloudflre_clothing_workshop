import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createDb } from '../db'
import { JobRepository } from '../repositories/job.repository'
import { FabricRepository } from '../repositories/fabric.repository'
import { TailorRepository } from '../repositories/tailor.repository'
import { DesignRepository } from '../repositories/design.repository'
import { JobService } from '../services/job.service'
import { TransitionService } from '../services/transition.service'
import { createJobSchema, updateJobSchema, transitionJobSchema } from '../validators/job.validator'
import { ok, created, noContent } from '../utils/response'
import type { AppContext } from '../types'

const jobs = new Hono<AppContext>()

function buildServices(c: { env: AppContext['Bindings'] }) {
  const db = createDb(c.env.DB)
  const jobRepo = new JobRepository(db)
  const fabricRepo = new FabricRepository(db)
  const tailorRepo = new TailorRepository(db)
  const designRepo = new DesignRepository(db)
  const jobService = new JobService(jobRepo, fabricRepo, tailorRepo, designRepo)
  const transitionService = new TransitionService(jobRepo, fabricRepo, tailorRepo)
  return { jobService, transitionService }
}

jobs.get('/', async (c) => {
  const { jobService } = buildServices(c)
  const data = await jobService.list(c.get('tenantId'))
  return ok(c, data)
})

jobs.get('/:id', async (c) => {
  const { jobService } = buildServices(c)
  const data = await jobService.getById(c.req.param('id'), c.get('tenantId'))
  return ok(c, data)
})

jobs.post('/', zValidator('json', createJobSchema), async (c) => {
  const { jobService } = buildServices(c)
  const data = await jobService.create(c.get('tenantId'), c.req.valid('json'))
  return created(c, data)
})

jobs.patch('/:id', zValidator('json', updateJobSchema), async (c) => {
  const { jobService } = buildServices(c)
  const data = await jobService.update(c.req.param('id'), c.get('tenantId'), c.req.valid('json'))
  return ok(c, data)
})

jobs.post('/:id/transition', zValidator('json', transitionJobSchema), async (c) => {
  const { transitionService } = buildServices(c)
  const { targetStatus, metersUsed, piecesCompleted } = c.req.valid('json')
  const data = await transitionService.transitionJob(
    c.req.param('id'),
    targetStatus,
    c.get('tenantId'),
    { metersUsed, piecesCompleted },
  )
  return ok(c, data)
})

jobs.delete('/:id', async (c) => {
  const { jobService } = buildServices(c)
  await jobService.delete(c.req.param('id'), c.get('tenantId'))
  return noContent(c)
})

export default jobs
