import { z } from 'zod'

export const createFabricSchema = z.object({
  fabricCode: z.string().min(1).max(50),
  type: z.string().min(1).max(100),
  color: z.string().max(50).optional(),
  supplier: z.string().max(100).optional(),
  initialQty: z.number().min(0),
  costPerMeter: z.number().min(0).optional().default(0),
  isClientOwned: z.boolean().optional().default(false),
  clientId: z.string().optional(),
  lowStockThreshold: z.number().min(0).optional().default(5),
})

export const updateFabricSchema = z.object({
  fabricCode: z.string().min(1).max(50).optional(),
  type: z.string().min(1).max(100).optional(),
  color: z.string().max(50).optional(),
  supplier: z.string().max(100).optional(),
  costPerMeter: z.number().min(0).optional(),
  isClientOwned: z.boolean().optional(),
  clientId: z.string().optional(),
  lowStockThreshold: z.number().min(0).optional(),
})

export const adjustStockSchema = z.object({
  quantity: z.number(),
  reason: z.string().min(1).max(200),
})

export type CreateFabricInput = z.infer<typeof createFabricSchema>
export type UpdateFabricInput = z.infer<typeof updateFabricSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
