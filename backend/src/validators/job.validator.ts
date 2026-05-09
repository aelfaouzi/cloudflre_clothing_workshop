import { z } from 'zod'

export const fabricLinkSchema = z.object({
  fabricId: z.string().uuid(),
  metersReserved: z.number().min(0.01),
})

export const createJobSchema = z.object({
  designId: z.string().uuid().optional(),
  tailorId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
  piecesExpected: z.number().int().min(1),
  dueDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  fabricLinks: z.array(fabricLinkSchema).optional().default([]),
})

export const updateJobSchema = z.object({
  designId: z.string().uuid().optional(),
  tailorId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  piecesExpected: z.number().int().min(1).optional(),
  piecesCompleted: z.number().int().min(0).optional(),
  dueDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  fabricLinks: z.array(fabricLinkSchema).optional(),
})

export const transitionJobSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'CUTTING', 'SEWING', 'READY', 'DISPATCHED', 'CANCELED']),
  metersUsed: z
    .array(
      z.object({
        fabricId: z.string().uuid(),
        metersUsed: z.number().min(0),
        metersWasted: z.number().min(0).optional().default(0),
      }),
    )
    .optional(),
  piecesCompleted: z.number().int().min(0).optional(),
})

export const createDesignSchema = z.object({
  name: z.string().min(1).max(100),
  targetAudience: z.string().max(100).optional(),
  sizeConfigJson: z.string().optional().default('{}'),
})

export const updateDesignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetAudience: z.string().max(100).optional(),
  sizeConfigJson: z.string().optional(),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type TransitionJobInput = z.infer<typeof transitionJobSchema>
export type CreateDesignInput = z.infer<typeof createDesignSchema>
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>
export type FabricLinkInput = z.infer<typeof fabricLinkSchema>
