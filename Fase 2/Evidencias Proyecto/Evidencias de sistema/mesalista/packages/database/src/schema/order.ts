import {
  pgTable,
  integer,
  varchar,
  serial,
  timestamp,
  text,
  pgEnum
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { Static, Type } from '@sinclair/typebox'
import { productPriceTable, productTable } from './product'
import { tableSessionTable } from './table'
import { storeTable } from './store'
import { sql } from 'drizzle-orm'
import { modifierOptionTable } from './modifier'
import { orgUserTable } from './auth'

// Definición de ENUM para estados
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'in_progress',
  'completed',
  'delivered',
  'cancelled'
])
export const roundStatusEnum = pgEnum('round_status', [
  'pending',
  'in_progress',
  'completed',
  'delivered',
  'cancelled'
])

// Nueva tabla para órdenes
export const orderTable = pgTable('order', {
  id: serial('id').notNull().primaryKey(),
  idTableSession: integer('id_table_session').references(
    () => tableSessionTable.id
  ),
  idStore: integer('id_store')
    .notNull()
    .references(() => storeTable.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  totalAmount: integer('total_amount').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  idOrgUser: integer('id_org_user').references(() => orgUserTable.id),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertOrderSchema = createInsertSchema(orderTable)
export const selectOrderSchema = createSelectSchema(orderTable)

export type InsertOrderSchema = Static<typeof insertOrderSchema>
export type SelectOrderSchema = Static<typeof selectOrderSchema>

export const orderRoundTable = pgTable('order_round', {
  id: serial('id').notNull().primaryKey(),
  idOrder: integer('id_order')
    .notNull()
    .references(() => orderTable.id),
  status: roundStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertOrderRoundSchema = createInsertSchema(orderRoundTable)
export const selectOrderRoundSchema = createSelectSchema(orderRoundTable)

export type InsertOrderRoundSchema = Static<typeof insertOrderRoundSchema>
export type SelectOrderRoundSchema = Static<typeof selectOrderRoundSchema>

export const orderItemTable = pgTable('order_item', {
  id: serial('id').notNull().primaryKey(),
  idRound: integer('id_order_round')
    .notNull()
    .references(() => orderRoundTable.id),
  idProduct: integer('id_product').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  idPrice: integer('id_price')
    .notNull()
    .references(() => productPriceTable.id),
  subtotal: integer('subtotal').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date())
})

export const insertOrderItemSchema = createInsertSchema(orderItemTable)
export const selectOrderItemSchema = createSelectSchema(orderItemTable)

export const insertOrderItemWithoutIdOrderSchema = createInsertSchema(
  orderItemTable,
  {
    idRound: Type.Optional(Type.Number({ min: 0 })),
    productName: Type.Optional(Type.String())
  }
)

export type InsertOrderItemSchema = Static<typeof insertOrderItemSchema>
export type SelectOrderItemSchema = Static<typeof selectOrderItemSchema>

export const orderItemModifierTable = pgTable('order_item_modifier', {
  id: serial('id').notNull().primaryKey(),
  idOrderItem: integer('id_order_item')
    .notNull()
    .references(() => orderItemTable.id),
  idModifierOption: integer('id_modifier_option').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  price: integer('price').notNull()
})

export const insertOrderItemModifierSchema = createInsertSchema(
  orderItemModifierTable
)
export const selectOrderItemModifierSchema = createSelectSchema(
  orderItemModifierTable
)

export type InsertOrderItemModifierSchema = Static<
  typeof insertOrderItemModifierSchema
>
export type SelectOrderItemModifierSchema = Static<
  typeof selectOrderItemModifierSchema
>

const selectOrderItemDto = Type.Object({
  idTable: Type.Number(),
  idTableSession: Type.Number(),
  statusRound: Type.String(),
  idRound: Type.Number(),
  createdAt: Type.String(),
  totalAmount: Type.Number()
})

const orderItemWithProductNameSchema = Type.Intersect([
  insertOrderItemWithoutIdOrderSchema,
  Type.Object({
    productName: Type.String()
  })
])

export const selectOrderItemsDto = Type.Intersect([
  selectOrderItemDto,
  Type.Object({
    orderItem: Type.Array(orderItemWithProductNameSchema)
  })
])

export type SelectOrderItemDto = Static<typeof selectOrderItemDto>
export type SelectOrderItemsDto = Static<typeof selectOrderItemsDto>

export const roundStatus = Type.Enum({
  pending: 'pending',
  in_progress: 'in_progress',
  delivered: 'delivered',
  cancelled: 'cancelled',
  completed: 'completed'
})

export type RoundStatus = Static<typeof roundStatus>

// "orderId": 2,
//       "orderItemId": 1,
//       "quantity": 1,
//       "productName": "Hamburguesa clasica",
//       "productDescription": "",
//       "notes": null,
//       "modifiers": null

export const selectOrderInfoModifiers = Type.Object({
  orderId: Type.Number(),
  orderItemId: Type.Number(),
  quantity: Type.Number(),
  productName: Type.String(),
  productDescription: Type.String(),
  notes: Type.Optional(Type.String()),
  modifiers: Type.Optional(
    Type.Array(
      Type.Object({
        name: Type.String(),
        price: Type.Number()
      })
    )
  )
})

export type SelectOrderInfoModifiers = Static<typeof selectOrderInfoModifiers>
