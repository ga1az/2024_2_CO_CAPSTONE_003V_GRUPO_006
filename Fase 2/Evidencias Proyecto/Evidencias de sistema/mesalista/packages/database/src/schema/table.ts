import {
  pgTable,
  integer,
  varchar,
  boolean,
  serial,
  timestamp,
  jsonb,
  pgEnum
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { Static, Type } from '@sinclair/typebox'
import { storeTable } from './store'
import { sql } from 'drizzle-orm'

export const tableTable = pgTable('table', {
  id: serial('id').notNull().primaryKey(),
  // NOTE: identifier is the table number, e.g. 1, 2 or A1, B2
  identifier: varchar('identifier', { length: 100 }).notNull().unique(),
  idStore: integer('id_store')
    .notNull()
    .references(() => storeTable.id),
  capacity: integer('capacity').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  deviceId: varchar('device_id', { length: 100 }).unique(),
  qrCode: varchar('qr_code', { length: 500 }).unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertTableSchema = createInsertSchema(tableTable, {
  identifier: Type.String({ minLength: 1 }),
  capacity: Type.Number({ min: 1 })
})

export const updateTableSchema = createInsertSchema(tableTable, {
  identifier: Type.Optional(Type.String({ minLength: 1 })),
  capacity: Type.Optional(Type.Number({ min: 1 })),
  isActive: Type.Optional(Type.Boolean()),
  deviceId: Type.Optional(Type.String({ minLength: 1 })),
  qrCode: Type.Optional(Type.String({ minLength: 1 }))
})

export const selectTableSchema = createSelectSchema(tableTable)

export type InsertTableSchema = Static<typeof insertTableSchema>
export type SelectTableSchema = Static<typeof selectTableSchema>

export const updateTableDTO = Type.Omit(updateTableSchema, [
  'idStore',
  'updatedAt',
  'createdAt',
  'id'
])

export const insertTableDTO = Type.Omit(insertTableSchema, [
  'idStore',
  'updatedAt',
  'createdAt',
  'id'
])

export type UpdateTableDTO = Static<typeof updateTableDTO>
export type InsertTableDTO = Static<typeof insertTableDTO>

export const sessionStatusEnum = pgEnum('session_status', [
  'active',
  'completed',
  'cancelled'
])

export enum SessionStatus {
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export const tableSessionTable = pgTable('table_session', {
  id: serial('id').notNull().primaryKey(),
  idTable: integer('id_table')
    .notNull()
    .references(() => tableTable.id),
  status: sessionStatusEnum('status').notNull().default('active'),
  sessionToken: varchar('session_token', { length: 100 }).unique(),
  cart: jsonb('cart').notNull().default('{}'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  customerCount: integer('customer_count'),
  tmpCode: varchar('tmp_code', { length: 100 }),
  expiresAt: timestamp('expires_at')
})

export const insertTableSessionSchema = createInsertSchema(tableSessionTable, {
  status: Type.Optional(Type.Enum(SessionStatus)),
  sessionToken: Type.Optional(Type.String({ minLength: 1 })),
  cart: Type.Optional(Type.Array(Type.Any())),
  customerCount: Type.Optional(Type.Number({ min: 1 }))
})

export const updateTableSessionSchema = createInsertSchema(tableSessionTable, {
  status: Type.Optional(Type.Enum(SessionStatus)),
  sessionToken: Type.Optional(Type.String({ minLength: 1 })),
  cart: Type.Optional(Type.Array(Type.Any())),
  customerCount: Type.Optional(Type.Number({ min: 1 })),
  tmpCode: Type.Optional(Type.String({ minLength: 1 }))
})
export const selectTableSessionSchema = createSelectSchema(tableSessionTable)

export type InsertTableSessionSchema = Static<typeof insertTableSessionSchema>
export type SelectTableSessionSchema = Static<typeof selectTableSessionSchema>

export const cartSchema = Type.Object({
  id: Type.String(),
  user: Type.Array(
    Type.Object({
      userName: Type.String(),
      items: Type.Optional(
        Type.Array(
          Type.Object({
            id: Type.String(),
            name: Type.String(),
            price: Type.Number(),
            quantity: Type.Number(),
            modifier: Type.Array(
              Type.Object({
                id: Type.String(),
                name: Type.String(),
                price: Type.Number()
              })
            )
          })
        )
      )
    })
  )
})

export type CartSchema = Static<typeof cartSchema>
