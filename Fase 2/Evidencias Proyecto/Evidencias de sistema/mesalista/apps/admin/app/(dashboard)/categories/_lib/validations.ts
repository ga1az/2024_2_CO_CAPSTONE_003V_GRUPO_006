import { z } from 'zod'
import { createSearchParamsSchema } from '@/lib/validations/shared'

// Categories use sort field as default sorting
export const searchParamsSchema = createSearchParamsSchema('sort:asc')

// Base schema with common fields and their validations
const categoryBaseSchema = {
  name: z.string().min(1, 'Name is required'),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  isActive: z.boolean().optional().default(true),
  bgImage: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  sort: z.number().optional().default(0)
} as const

// Insert schema - required fields are maintained
export const insertCategoryResolver = z.object({
  ...categoryBaseSchema
})

// Update schema - all fields are optional
export const updateCategoryResolver = z.object({
  ...Object.fromEntries(
    Object.entries(categoryBaseSchema).map(([key, schema]) => [
      key,
      schema instanceof z.ZodOptional ? schema : schema.optional()
    ])
  )
})

// Type inference
export type InsertCategory = z.infer<typeof insertCategoryResolver>
export type UpdateCategory = z.infer<typeof updateCategoryResolver>
