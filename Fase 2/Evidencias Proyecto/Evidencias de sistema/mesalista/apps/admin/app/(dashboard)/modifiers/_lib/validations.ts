// validations.ts
import { z } from 'zod'
import { createSearchParamsSchema } from '@/lib/validations/shared'
import { SelectModifierResponseSchema } from '@mesalista/database/src/schema'

export const searchParamsSchema = createSearchParamsSchema('id:desc')

// Base schema with common fields and their validations
const ModifierBaseSchema = {
  name: z.string().min(1, 'Name is required'),
  isMultipleChoice: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  options: z
    .array(
      z.object({
        name: z.string().min(1, 'Option name is required'),
        overcharge: z.number().min(0).default(0),
        idOption: z.number().optional() // Add this for existing options
      })
    )
    .default([]),
  products: z
    .array(
      z.object({
        name: z.string(),
        idProduct: z.number()
      })
    )
    .default([]),
  idProducts: z.array(z.number()).default([])
} as const

// Insert schema - required fields are maintained
export const insertModifierResolver = z.object({
  ...ModifierBaseSchema,
  options: z
    .array(
      z.object({
        name: z.string().min(1, 'Option name is required'),
        overcharge: z.number().min(0).default(0),
        idOption: z.number().optional()
      })
    )
    .min(1, 'At least one option is required')
    .default([]),
  idProducts: z
    .array(z.number())
    .min(1, 'At least one product is required')
    .default([])
})

// Update schema - make fields optional but maintain structure
export const updateModifierResolver = z
  .object({
    id: z.number(),
    name: ModifierBaseSchema.name.optional(),
    isMultipleChoice: ModifierBaseSchema.isMultipleChoice.optional(),
    isRequired: ModifierBaseSchema.isRequired.optional(),
    options: ModifierBaseSchema.options.optional(),
    products: ModifierBaseSchema.products.optional()
  })
  .refine(
    (data) => {
      // Only validate if options are being updated
      if (data.options && data.options.length === 0) {
        return false
      }
      return true
    },
    {
      message: 'At least one option is required',
      path: ['options']
    }
  )

export type InsertModifier = z.infer<typeof insertModifierResolver>
export type UpdateModifier = z.infer<typeof updateModifierResolver>

export const toUpdateModifierDTO = {
  fromResponse: z
    .object({
      data: z.custom<SelectModifierResponseSchema>()
    })
    .or(z.custom<SelectModifierResponseSchema>())
    .transform((response) => {
      // Handle both cases: when data is nested and when it's direct
      const modifier = 'data' in response ? response.data : response
      return {
        id: modifier.id ?? 0,
        name: modifier.name,
        isMultipleChoice: modifier.isMultipleChoice,
        isRequired: modifier.isRequired,
        options: modifier.options ?? [],
        products: modifier.products ?? []
      }
    }),

  fromModifier: z
    .custom<SelectModifierResponseSchema>()
    .transform((modifier) => ({
      id: modifier.id ?? 0,
      name: modifier.name,
      isMultipleChoice: modifier.isMultipleChoice,
      isRequired: modifier.isRequired,
      options: modifier.options ?? [],
      products: modifier.products ?? []
    }))
}

export type ToUpdateModifierDTO = z.infer<
  typeof toUpdateModifierDTO.fromResponse
>
