import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createDb } from '../db'
import { TailorRepository } from '../repositories/tailor.repository'
import { TailorService } from '../services/tailor.service'
import { createTailorSchema, updateTailorSchema } from '../validators/tailor.validator'
import { ok, created, noContent } from '../utils/response'
import type { AppContext } from '../types'

const tailors = new Hono<AppContext>()

tailors.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const service = new TailorService(new TailorRepository(db), db)
  const data = await service.list(c.get('tenantId'))
  return ok(c, data)
})

tailors.get('/active', async (c) => {
  const db = createDb(c.env.DB)
  const service = new TailorService(new TailorRepository(db), db)
  const data = await service.listActive(c.get('tenantId'))
  return ok(c, data)
})

tailors.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const service = new TailorService(new TailorRepository(db), db)
  const data = await service.getById(c.req.param('id'), c.get('tenantId'))
  return ok(c, data)
})

tailors.post('/', zValidator('json', createTailorSchema), async (c) => {
  const db = createDb(c.env.DB)
  const service = new TailorService(new TailorRepository(db), db)
  const data = await service.create(c.get('tenantId'), c.req.valid('json'))
  return created(c, data)
})

tailors.patch('/:id', zValidator('json', updateTailorSchema), async (c) => {
  const db = createDb(c.env.DB)
  const service = new TailorService(new TailorRepository(db), db)
  const data = await service.update(c.req.param('id'), c.get('tenantId'), c.req.valid('json'))
  return ok(c, data)
})

tailors.delete('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const service = new TailorService(new TailorRepository(db), db)
  await service.delete(c.req.param('id'), c.get('tenantId'))
  return noContent(c)
})

export default tailors
