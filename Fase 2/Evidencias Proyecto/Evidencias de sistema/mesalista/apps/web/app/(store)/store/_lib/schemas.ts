import { z } from 'zod'

// Modifier Option Schema
export const ModifierOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  overcharge: z.number()
})

// Modifier Schema
export const ModifierSchema = z.object({
  id: z.number(),
  name: z.string(),
  options: z.array(ModifierOptionSchema).nullable(),
  isMultiple: z.boolean(),
  isRequired: z.boolean()
})

// Product Schema
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  bgImage: z.string().nullable(),
  // Change this line to handle null modifiers
  modifiers: z.array(ModifierSchema).nullable().default([])
})

// Category Schema
export const CategorySchema = z.object({
  id: z.number(),
  id_store: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  bg_image: z.string(),
  sort: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  // Make products nullable with default empty array
  products: z.array(ProductSchema).nullable().default([])
})

// Store Schema
export const StoreSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  desc: z.string(),
  bgImage: z.string(),
  currency: z.string(),
  currencySymbol: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  qrUrl: z.string().nullable(),
  personalization: z.any().nullable(),
  mapUrl: z.string().nullable(),
  address: z.string(),
  email: z.string().nullable(),
  openingHours: z.record(
    z.string(),
    z.array(
      z.object({
        open: z.string(),
        close: z.string()
      })
    )
  ),
  // Make items nullable with default empty array
  items: z.array(CategorySchema).nullable().default([])
})

// API Response Schema
export const APIResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: StoreSchema.nullable(),
  error: z.string().optional()
})

export type APIResponse = z.infer<typeof APIResponseSchema>
export type Store = z.infer<typeof StoreSchema>
export type Category = z.infer<typeof CategorySchema>
export type Product = z.infer<typeof ProductSchema>
export type Modifier = z.infer<typeof ModifierSchema>
export type ModifierOption = z.infer<typeof ModifierOptionSchema>
