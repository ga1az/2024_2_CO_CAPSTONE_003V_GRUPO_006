import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import { sql } from 'drizzle-orm'

export const orgUserTable = pgTable('org_user', {
  id: serial('id').notNull().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  image: text('image'),
  role: text('role', {
    enum: ['admin', 'kitchen', 'waiter']
  })
    .notNull()
    .default('admin'),
  password: text('password').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertOrgUserSchema = createInsertSchema(orgUserTable, {
  role: Type.Enum({
    admin: 'admin',
    kitchen: 'kitchen',
    waiter: 'waiter'
  }),
  password: Type.String({ minLength: 8 }),
  email: Type.String({ minLength: 5 }),
  name: Type.String({ minLength: 1 })
})
export const selectOrgUserSchema = createSelectSchema(orgUserTable, {
  password: Type.Optional(Type.String())
})

export const updateOrgUserSchema = createInsertSchema(orgUserTable, {
  role: Type.Optional(
    Type.Enum({
      admin: 'admin',
      kitchen: 'kitchen',
      waiter: 'waiter'
    })
  ),
  password: Type.Optional(Type.String({ minLength: 8 })),
  email: Type.Optional(Type.String({ minLength: 5 })),
  name: Type.Optional(Type.String({ minLength: 1 })),
  image: Type.Optional(Type.String({ minLength: 1 })),
  isActive: Type.Optional(Type.Boolean())
})

export type InsertOrgUserSchema = Static<typeof insertOrgUserSchema>
export type SelectOrgUserSchema = Static<typeof selectOrgUserSchema>

export const forgotPasswordTable = pgTable('forgot_password', {
  id: serial('id').notNull().primaryKey(),
  email: varchar('email', { length: 100 }).notNull(),
  token: varchar('token', { length: 100 }).notNull(),
  revoked: boolean('revoked').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertForgotPasswordSchema =
  createInsertSchema(forgotPasswordTable)
export const selectForgotPasswordSchema =
  createSelectSchema(forgotPasswordTable)

export type InsertForgotPasswordSchema = Static<
  typeof insertForgotPasswordSchema
>
export type SelectForgotPasswordSchema = Static<
  typeof selectForgotPasswordSchema
>
