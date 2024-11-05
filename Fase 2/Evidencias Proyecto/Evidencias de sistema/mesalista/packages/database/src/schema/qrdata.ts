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
import { storeTable } from './store'
import { sql } from 'drizzle-orm'

export const qrTable = pgTable('qr_table', {
  id: serial('id').notNull().primaryKey(),
  fgColor: varchar('fg_color', { length: 100 }).default('#000000'),
  hideLogo: boolean('hide_logo').notNull().default(true),
  logo: varchar('logo', { length: 100 }).default(''),
  scale: integer('scale').notNull().default(1),
  idStore: integer('id_store')
    .notNull()
    .references(() => storeTable.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertQRSchema = createInsertSchema(qrTable, {
  id: Type.Optional(Type.Number()),
  idStore: Type.Optional(Type.Number())
})
export const selectQRSchema = createSelectSchema(qrTable)

export const updateQRSchema = createInsertSchema(qrTable, {
  id: Type.Optional(Type.Number()),
  idStore: Type.Optional(Type.Number())
})

export type InsertQRSchema = Static<typeof insertQRSchema>
export type SelectQRSchema = Static<typeof selectQRSchema>
export type UpdateQRSchema = Static<typeof updateQRSchema>
