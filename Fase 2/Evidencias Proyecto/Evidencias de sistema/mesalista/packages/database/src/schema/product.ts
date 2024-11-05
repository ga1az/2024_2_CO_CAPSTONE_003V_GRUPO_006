import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  serial
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { Static, Type } from '@sinclair/typebox'
import { categoryTable, selectCategorySchema } from './category'
import { sql } from 'drizzle-orm'

export const productTable = pgTable('product', {
  id: serial('id').notNull().primaryKey(),
  idCategory: integer('id_category')
    .notNull()
    .references(() => categoryTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 200 }),
  isActive: boolean('is_active').notNull().default(true),
  bgImage: varchar('bg_image', { length: 200 }),
  isGlutenFree: boolean('is_gluten_free'),
  isVegan: boolean('is_vegan'),
  isNew: boolean('is_new'),
  isPopular: boolean('is_popular'),
  isSpicy: boolean('is_spicy'),
  kcal: integer('kcal'),
  sort: integer('sort').notNull().default(0),
  isSoloItem: boolean('is_solo_item').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertProductSchema = createInsertSchema(productTable, {
  name: Type.String({ minLength: 1 }),
  bgImage: Type.Optional(Type.String())
})

export const updateProductSchema = createInsertSchema(productTable, {
  name: Type.Optional(Type.String({ minLength: 1 })),
  bgImage: Type.Optional(Type.String()),
  idCategory: Type.Optional(Type.Number())
})

export const selectProductSchema = createSelectSchema(productTable, {
  description: Type.Optional(Type.String())
})

export const selectProductPriceCategorySchema = Type.Object({
  ...selectProductSchema.properties,
  price: Type.Number(),
  category: Type.String()
})

export type InsertProductSchema = Static<typeof insertProductSchema>
export type SelectProductSchema = Static<typeof selectProductSchema>
export type SelectProductPriceCategory = Static<
  typeof selectProductPriceCategorySchema
>

export const productPriceTable = pgTable('product_price', {
  id: serial('id').notNull().primaryKey(),
  idProduct: integer('id_product')
    .notNull()
    .references(() => productTable.id, { onDelete: 'cascade' }),
  price: integer('price').notNull(),
  startDate: timestamp('start_date').notNull().defaultNow(),
  endDate: timestamp('end_date'),
  isDiscount: boolean('is_discount').notNull().default(false),
  discount: integer('discount'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertProductPriceSchema = createInsertSchema(productPriceTable, {
  price: Type.Number({ min: 0 }),
  idProduct: Type.Optional(Type.Number({ min: 0 }))
})

export const insertProductPriceWithIdProductSchema = createInsertSchema(
  productPriceTable,
  {
    price: Type.Number({ min: 0 })
  }
)

export const updateProductPriceSchema = createInsertSchema(productPriceTable, {
  price: Type.Optional(Type.Number({ min: 0 }))
})

export const selectProductPriceSchema = createSelectSchema(productPriceTable)

export type InsertProductPriceSchema = Static<typeof insertProductPriceSchema>
export type SelectProductPriceSchema = Static<typeof selectProductPriceSchema>
export type InsertProductPriceWithIdProductSchema = Static<
  typeof insertProductPriceWithIdProductSchema
>

export const insertProductWithPriceSchema = Type.Intersect([
  insertProductSchema,
  Type.Object({
    price: Type.Number({ min: 0 })
  })
])

export const productWithPriceSchema = Type.Intersect([
  selectProductSchema,
  Type.Optional(
    Type.Object({
      price: Type.Optional(selectProductPriceSchema)
    })
  )
])

export type ProductWithPriceSchema = Static<typeof productWithPriceSchema>

export const categoryWithProductsSchema = Type.Intersect([
  selectCategorySchema,
  Type.Object({
    products: Type.Array(productWithPriceSchema)
  })
])

export type CategoryWithProductsSchema = Static<
  typeof categoryWithProductsSchema
>

export const insertProductDTO = Type.Omit(insertProductWithPriceSchema, [
  'createdAt',
  'updatedAt'
])

export type InsertProductDTO = Static<typeof insertProductDTO>

export const updateProductWithPriceSchema = Type.Intersect([
  updateProductSchema,
  Type.Object({
    price: Type.Optional(Type.Number({ min: 0 }))
  })
])

export type UpdateProductWithPriceSchema = Static<
  typeof updateProductWithPriceSchema
>

export const updateProductDTO = Type.Partial(
  Type.Object({
    id: Type.Number(),
    idCategory: Type.Optional(Type.Number()),
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    isActive: Type.Boolean(),
    bgImage: Type.Optional(Type.String()),
    isGlutenFree: Type.Optional(Type.Boolean()),
    isVegan: Type.Optional(Type.Boolean()),
    isNew: Type.Optional(Type.Boolean()),
    isPopular: Type.Optional(Type.Boolean()),
    isSpicy: Type.Optional(Type.Boolean()),
    kcal: Type.Optional(Type.Number()),
    sort: Type.Number(),
    isSoloItem: Type.Boolean(),
    price: Type.Number({ min: 0 })
  })
)

export type UpdateProductDTO = Static<typeof updateProductDTO>

export const productDetailsResponseSchema = Type.Object({
  data: Type.Object({
    product: selectProductSchema,
    product_price: Type.Optional(selectProductPriceSchema)
  })
})

export type ProductDetailsResponse = Static<typeof productDetailsResponseSchema>
