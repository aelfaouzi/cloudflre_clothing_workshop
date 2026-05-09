import { z } from 'zod'

export const createTailorSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  payRatePerPiece: z.number().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export const updateTailorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  payRatePerPiece: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

export type CreateTailorInput = z.infer<typeof createTailorSchema>
export type UpdateTailorInput = z.infer<typeof updateTailorSchema>
