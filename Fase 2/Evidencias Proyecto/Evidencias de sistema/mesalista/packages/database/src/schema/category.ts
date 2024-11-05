import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  serial
} from 'drizzle-orm/pg-core'
import { storeTable } from './store'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { Static, Type } from '@sinclair/typebox'
import { sql } from 'drizzle-orm'

export const categoryTable = pgTable('category', {
  id: serial('id').notNull().primaryKey(),
  idStore: integer('id_store')
    .notNull()
    .references(() => storeTable.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 200 }),
  isActive: boolean('is_active').notNull().default(true),
  bgImage: varchar('bg_image', { length: 200 }),
  sort: integer('sort').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertCategorySchema = createInsertSchema(categoryTable, {
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String({ minLength: 1 })),
  bgImage: Type.Optional(Type.String({ minLength: 1 })),
  sort: Type.Optional(Type.Number({ min: 0 }))
})

export const updateCategorySchema = createInsertSchema(categoryTable, {
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String({ minLength: 1 })),
  bgImage: Type.Optional(Type.String()),
  sort: Type.Optional(Type.Number({ min: 0 })),
  idStore: Type.Optional(Type.Number({ minimum: 1 }))
})

export const selectCategorySchema = createSelectSchema(categoryTable)

export type InsertCategorySchema = Static<typeof insertCategorySchema>
export type SelectCategorySchema = Static<typeof selectCategorySchema>
export type UpdateCategorySchema = Static<typeof updateCategorySchema>
