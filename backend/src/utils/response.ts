import type { Context } from 'hono'

export function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, data }, status)
}

export function created<T>(c: Context, data: T) {
  return c.json({ success: true, data }, 201)
}

export function noContent(c: Context) {
  return c.body(null, 204)
}

export function errorResponse(c: Context, message: string, status: number, code?: string) {
  return c.json({ success: false, error: { message, code: code ?? 'ERROR' } }, status as 400 | 401 | 403 | 404 | 409 | 422 | 500)
}
