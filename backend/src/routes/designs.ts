import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createDb } from '../db'
import { DesignRepository } from '../repositories/design.repository'
import { DesignService } from '../services/design.service'
import { createDesignSchema, updateDesignSchema } from '../validators/job.validator'
import { ok, created, noContent } from '../utils/response'
import type { AppContext } from '../types'

const designs = new Hono<AppContext>()

designs.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const service = new DesignService(new DesignRepository(db))
  const data = await service.list(c.get('tenantId'))
  return ok(c, data)
})

designs.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const service = new DesignService(new DesignRepository(db))
  const data = await service.getById(c.req.param('id'), c.get('tenantId'))
  return ok(c, data)
})

designs.post('/', zValidator('json', createDesignSchema), async (c) => {
  const db = createDb(c.env.DB)
  const service = new DesignService(new DesignRepository(db))
  const data = await service.create(c.get('tenantId'), c.req.valid('json'))
  return created(c, data)
})

designs.patch('/:id', zValidator('json', updateDesignSchema), async (c) => {
  const db = createDb(c.env.DB)
  const service = new DesignService(new DesignRepository(db))
  const data = await service.update(c.req.param('id'), c.get('tenantId'), c.req.valid('json'))
  return ok(c, data)
})

designs.delete('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const service = new DesignService(new DesignRepository(db))
  await service.delete(c.req.param('id'), c.get('tenantId'))
  return noContent(c)
})

export default designs
