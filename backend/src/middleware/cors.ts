import { cors } from 'hono/cors'
import type { AppContext } from '../types'
import type { MiddlewareHandler } from 'hono'

export function createCorsMiddleware(): MiddlewareHandler<AppContext> {
  return cors({
    origin: (origin, c) => {
      const allowed = c.env.CORS_ORIGIN ?? 'http://localhost:5173'
      if (origin === allowed || allowed === '*') return origin
      return null
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
    credentials: true,
  })
}
