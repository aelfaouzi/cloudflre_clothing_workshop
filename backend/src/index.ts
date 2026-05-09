import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { authMiddleware } from './middleware/auth'
import { createCorsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/error-handler'
import fabricsRoute from './routes/fabrics'
import tailorsRoute from './routes/tailors'
import jobsRoute from './routes/jobs'
import dashboardRoute from './routes/dashboard'
import designsRoute from './routes/designs'
import type { AppContext } from './types'

const app = new Hono<AppContext>()

app.use('*', createCorsMiddleware())
app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

const api = new Hono<AppContext>()
api.use('*', authMiddleware)

api.route('/fabrics', fabricsRoute)
api.route('/tailors', tailorsRoute)
api.route('/jobs', jobsRoute)
api.route('/dashboard', dashboardRoute)
api.route('/designs', designsRoute)

app.route('/api', api)

app.onError(errorHandler)

app.notFound((c) => c.json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } }, 404))

export default app
