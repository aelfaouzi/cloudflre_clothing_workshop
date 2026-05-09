import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verifyToken } from '@clerk/backend'
import type { AppContext } from '../types'

export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid authorization header' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
    })

    c.set('userId', payload.sub)
    c.set('tenantId', payload.sub)

    await next()
  } catch {
    throw new HTTPException(401, { message: 'Invalid or expired token' })
  }
})
