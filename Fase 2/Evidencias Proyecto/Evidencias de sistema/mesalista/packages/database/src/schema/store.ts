import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  serial,
  jsonb,
  text
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { Static, Type } from '@sinclair/typebox'
import { sql } from 'drizzle-orm'

// Definición del esquema para openingHours
const timeSlotSchema = Type.Object({
  open: Type.String(),
  close: Type.String()
})

const dayScheduleSchema = Type.Array(timeSlotSchema)

const openingHoursSchema = Type.Object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema
})

export type OpeningHoursSchema = Static<typeof openingHoursSchema>

export const storeTable = pgTable('store', {
  id: serial('id').notNull().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  desc: varchar('desc', { length: 200 }),
  bgImage: varchar('bg_image', { length: 200 }),
  currency: varchar('currency', { length: 10 }).notNull().default('CLP'),
  currencySymbol: varchar('currency_symbol', { length: 10 })
    .notNull()
    .default('$'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
  qrUrl: varchar('qr_url', { length: 200 }),
  personalization: jsonb('personalization'),
  mapUrl: text('map_url'),
  address: varchar('address', { length: 200 }),
  email: varchar('email', { length: 100 }),
  openingHours: jsonb('opening_hours')
})

export const insertStoreSchema = createInsertSchema(storeTable, {
  name: Type.String({ minLength: 1 }),
  slug: Type.String({ minLength: 1 }),
  desc: Type.Optional(Type.String({ minLength: 1 })),
  bgImage: Type.Optional(Type.String({ minLength: 1 })),
  currency: Type.Optional(Type.String({ minLength: 1 })),
  currencySymbol: Type.Optional(Type.String({ minLength: 1 })),
  qrUrl: Type.Optional(Type.String({ minLength: 1 })),
  personalization: Type.Optional(Type.Object({})),
  openingHours: Type.Optional(openingHoursSchema),
  mapUrl: Type.Optional(Type.String({ minLength: 1 })),
  address: Type.Optional(Type.String({ minLength: 1 })),
  email: Type.Optional(Type.String({ minLength: 1 }))
})

export const updateStoreSchema = createInsertSchema(storeTable, {
  name: Type.Optional(Type.String({ minLength: 1 })),
  slug: Type.Optional(Type.String({ minLength: 1 })),
  desc: Type.Optional(Type.String()),
  bgImage: Type.Optional(Type.String()),
  currency: Type.Optional(Type.String()),
  currencySymbol: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
  qrUrl: Type.Optional(Type.String()),
  personalization: Type.Optional(Type.Object({})),
  openingHours: Type.Optional(openingHoursSchema),
  mapUrl: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
  email: Type.Optional(Type.String())
})

export type UpdateStoreSchema = Static<typeof updateStoreSchema>

export const selectStoreSchema = createSelectSchema(storeTable, {
  personalization: Type.Optional(Type.Object({}))
})

export type InsertStoreSchema = Static<typeof insertStoreSchema>
export type SelectStoreSchema = Static<typeof selectStoreSchema>
