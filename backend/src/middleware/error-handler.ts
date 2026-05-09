import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { AppError } from '../utils/errors'
import type { AppContext } from '../types'

export const errorHandler: ErrorHandler<AppContext> = (err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          issues: err.flatten().fieldErrors,
        },
      },
      400,
    )
  }

  if (err instanceof AppError) {
    return c.json(
      { success: false, error: { message: err.message, code: err.code ?? 'ERROR' } },
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 500,
    )
  }

  if (err instanceof HTTPException) {
    return c.json(
      { success: false, error: { message: err.message, code: 'HTTP_ERROR' } },
      err.status,
    )
  }

  console.error('Unhandled error:', err)
  return c.json({ success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } }, 500)
}
