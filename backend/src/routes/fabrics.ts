import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createDb } from '../db'
import { FabricRepository } from '../repositories/fabric.repository'
import { FabricService } from '../services/fabric.service'
import { createFabricSchema, updateFabricSchema } from '../validators/fabric.validator'
import { ok, created, noContent } from '../utils/response'
import type { AppContext } from '../types'

const fabrics = new Hono<AppContext>()

fabrics.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const service = new FabricService(new FabricRepository(db))
  const data = await service.list(c.get('tenantId'))
  return ok(c, data)
})

fabrics.get('/low-stock', async (c) => {
  const db = createDb(c.env.DB)
  const service = new FabricService(new FabricRepository(db))
  const data = await service.getLowStock(c.get('tenantId'))
  return ok(c, data)
})

fabrics.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const service = new FabricService(new FabricRepository(db))
  const data = await service.getById(c.req.param('id'), c.get('tenantId'))
  return ok(c, data)
})

fabrics.post('/', zValidator('json', createFabricSchema), async (c) => {
  const db = createDb(c.env.DB)
  const service = new FabricService(new FabricRepository(db))
  const data = await service.create(c.get('tenantId'), c.req.valid('json'))
  return created(c, data)
})

fabrics.patch('/:id', zValidator('json', updateFabricSchema), async (c) => {
  const db = createDb(c.env.DB)
  const service = new FabricService(new FabricRepository(db))
  const data = await service.update(c.req.param('id'), c.get('tenantId'), c.req.valid('json'))
  return ok(c, data)
})

fabrics.delete('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const service = new FabricService(new FabricRepository(db))
  await service.delete(c.req.param('id'), c.get('tenantId'))
  return noContent(c)
})

export default fabrics
