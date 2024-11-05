import {
  pgTable,
  integer,
  varchar,
  boolean,
  serial,
  timestamp
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { Static, Type } from '@sinclair/typebox'
import { productTable } from './product'
import { storeTable } from './store'
import { sql } from 'drizzle-orm'

export const modifierTable = pgTable('modifier', {
  id: serial('id').notNull().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  isMultipleChoice: boolean('is_multiple_choice').notNull().default(false),
  isRequired: boolean('is_required').notNull().default(false),
  idStore: integer('id_store')
    .notNull()
    .references(() => storeTable.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertModifierSchema = createInsertSchema(modifierTable, {
  name: Type.String({ minLength: 1 })
})

export const updateModifierSchema = createInsertSchema(modifierTable, {
  name: Type.Optional(Type.String({ minLength: 1 })),
  isMultipleChoice: Type.Optional(Type.Boolean()),
  isRequired: Type.Optional(Type.Boolean()),
  idStore: Type.Optional(Type.Number())
})

export const selectModifierSchema = createSelectSchema(modifierTable, {
  id: Type.Optional(Type.Number()),
  idStore: Type.Optional(Type.Number())
})

export type InsertModifierSchema = Static<typeof insertModifierSchema>
export type UpdateModifierSchema = Static<typeof updateModifierSchema>
export type SelectModifierSchema = Static<typeof selectModifierSchema>

export const modifierOptionTable = pgTable('modifier_option', {
  id: serial('id').notNull().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  overcharge: integer('overcharge').notNull().default(0),
  idModifier: integer('id_modifier')
    .notNull()
    .references(() => modifierTable.id)
})

export const insertModifierOptionSchema =
  createInsertSchema(modifierOptionTable)

export const insertModifierOptionWithoutIdModifierSchema = createInsertSchema(
  modifierOptionTable,
  {
    idModifier: Type.Optional(Type.Number({ min: 0 }))
  }
)

export const updateModifierOptionSchema =
  createInsertSchema(modifierOptionTable)

export const selectModifierOptionSchema = createSelectSchema(
  modifierOptionTable,
  {
    id: Type.Optional(Type.Number()),
    idModifier: Type.Optional(Type.Number())
  }
)

export type InsertModifierOptionSchema = Static<
  typeof insertModifierOptionSchema
>
export type SelectModifierOptionSchema = Static<
  typeof selectModifierOptionSchema
>

export const modifierProductTable = pgTable('modifier_product', {
  id: serial('id').notNull().primaryKey(),
  idModifier: integer('id_modifier')
    .notNull()
    .references(() => modifierTable.id),
  idProduct: integer('id_product').notNull()
})

export const insertModifierProductSchema =
  createInsertSchema(modifierProductTable)
export const selectModifierProductSchema =
  createSelectSchema(modifierProductTable)

export type InsertModifierProductSchema = Static<
  typeof insertModifierProductSchema
>
export type SelectModifierProductSchema = Static<
  typeof selectModifierProductSchema
>

export const selectModifierResponseSchema = Type.Intersect([
  selectModifierSchema,
  Type.Object({
    products: Type.Array(
      Type.Object({
        name: Type.String(),
        idProduct: Type.Number()
      })
    )
  }),

  Type.Object({
    options: Type.Array(
      Type.Object({
        name: Type.String(),
        idOption: Type.Number(),
        overcharge: Type.Number()
      })
    )
  })
])

export type SelectModifierResponseSchema = Static<
  typeof selectModifierResponseSchema
>

const insertModifierOptionEditSchema = Type.Omit(insertModifierOptionSchema, [
  'idModifier'
])

export const createModifierDto = Type.Intersect([
  insertModifierSchema,
  Type.Object({ idProducts: Type.Array(Type.Number()) }),
  Type.Object({
    options: Type.Array(insertModifierOptionEditSchema)
  })
])

export type CreateModifierDto = Static<typeof createModifierDto>

export const updateModifierDTO = Type.Omit(updateModifierSchema, ['idStore'])

export const insertModifierDTO = Type.Omit(insertModifierSchema, ['idStore'])

export const insertModifierOptionWithoutIdOptSchema = Type.Omit(
  createModifierDto,
  ['idStore', 'updatedAt', 'createdAt', 'id']
)

export type InsertModifierOptionWithoutIdOptSchema = Static<
  typeof insertModifierOptionWithoutIdOptSchema
>

export const updateModifierDTOSchema = Type.Intersect([
  Type.Object({
    id: Type.Number(), // ID is required for updates
    name: Type.Optional(Type.String({ minLength: 1 })),
    isMultipleChoice: Type.Optional(Type.Boolean()),
    isRequired: Type.Optional(Type.Boolean()),
    products: Type.Array(
      Type.Object({
        name: Type.String(),
        idProduct: Type.Number()
      })
    ),
    options: Type.Array(
      Type.Object({
        name: Type.String(),
        idOption: Type.Optional(Type.Number()),
        overcharge: Type.Number()
      })
    )
  })
])

export type UpdateModifierDTOSchema = Static<typeof updateModifierDTOSchema>

export const bulkDeleteModifierDTO = Type.Object({
  ids: Type.Array(Type.Number())
})

export type BulkDeleteModifierDTO = Static<typeof bulkDeleteModifierDTO>
