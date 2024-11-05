import { pgTable, varchar, timestamp, serial, text } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { Static, Type } from '@sinclair/typebox'
import { sql } from 'drizzle-orm'

export const organizationTable = pgTable('organization', {
  id: serial('id').notNull().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  mapUrl: text('map_url'),
  address: varchar('address', { length: 200 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 100 }),
  logo: varchar('logo', { length: 200 }),
  description: text('description'),
  companyType: varchar('company_type', { length: 100 }).default('restaurant'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertOrganizationSchema = createInsertSchema(organizationTable, {
  name: Type.String({ minLength: 1 }),
  slug: Type.String({ minLength: 1 })
})

export const updateOrganizationSchema = createInsertSchema(organizationTable, {
  name: Type.Optional(Type.String({ minLength: 1 })),
  slug: Type.Optional(Type.String({ minLength: 1 })),
  mapUrl: Type.Optional(Type.String({ minLength: 1 })),
  address: Type.Optional(Type.String({ minLength: 1 })),
  phone: Type.Optional(Type.String({ minLength: 1 })),
  email: Type.Optional(Type.String({ minLength: 1 })),
  website: Type.Optional(Type.String({ minLength: 1 })),
  logo: Type.Optional(Type.String({ minLength: 1 })),
  description: Type.Optional(Type.String({ minLength: 1 })),
  companyType: Type.Optional(Type.String({ minLength: 1 }))
})

export const selectOrganizationSchema = createSelectSchema(organizationTable)

export type InsertOrganizationSchema = Static<typeof insertOrganizationSchema>
export type SelectOrganizationSchema = Static<typeof selectOrganizationSchema>
export type UpdateOrganizationSchema = Static<typeof updateOrganizationSchema>
