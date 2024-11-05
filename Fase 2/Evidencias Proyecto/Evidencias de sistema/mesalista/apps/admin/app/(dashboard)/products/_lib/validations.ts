import { z } from 'zod'
import { createSearchParamsSchema } from '@/lib/validations/shared'

// Product use sort field as default sorting
export const searchParamsSchema = createSearchParamsSchema('sort:asc')

// Base schema with common fields and their validations
const productBaseSchema = {
  name: z.string().min(1, 'Name is required'),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  isActive: z.boolean().optional(),
  bgImage: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  idCategory: z.number(),
  isGlutenFree: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  kcal: z.number().optional(),
  sort: z.number().optional(),
  isSoloItem: z.boolean().optional(),
  price: z.number()
} as const

// Insert schema - required fields are maintained
export const insertProductResolver = z.object({
  ...productBaseSchema
})

// Update schema - all fields are optional
export const updateProductResolver = z.object({
  ...Object.fromEntries(
    Object.entries(productBaseSchema).map(([key, schema]) => [
      key,
      schema instanceof z.ZodOptional ? schema : schema.optional()
    ])
  )
})

// Type inference
export type InsertProduct = z.infer<typeof insertProductResolver>
export type UpdateProduct = z.infer<typeof updateProductResolver>
