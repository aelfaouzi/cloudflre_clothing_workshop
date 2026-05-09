import { Hono } from 'hono'
import { createDb } from '../db'
import { JobRepository } from '../repositories/job.repository'
import { FabricRepository } from '../repositories/fabric.repository'
import { TailorRepository } from '../repositories/tailor.repository'
import { DashboardService } from '../services/dashboard.service'
import { ok } from '../utils/response'
import type { AppContext } from '../types'

const dashboard = new Hono<AppContext>()

dashboard.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const service = new DashboardService(
    new JobRepository(db),
    new FabricRepository(db),
    new TailorRepository(db),
  )
  const data = await service.getDashboard(c.get('tenantId'))
  return ok(c, data)
})

export default dashboard
