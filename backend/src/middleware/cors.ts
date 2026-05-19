import { cors } from 'hono/cors'
import type { AppContext } from '../types'
import type { MiddlewareHandler } from 'hono'

export function createCorsMiddleware(): MiddlewareHandler<AppContext> {
  return cors({
    origin: (origin, c) => {
      const allowed = (c.env.CORS_ORIGIN ?? 'http://localhost:5173').replace(/\/$/, '')
      const req     = (origin ?? '').replace(/\/$/, '')
      if (req === allowed || allowed === '*') return origin
      // allow any localhost port in development
      if (c.env.APP_ENV === 'development' && /^http:\/\/localhost:\d+$/.test(req)) return origin
      return null
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
    credentials: true,
  })
}
