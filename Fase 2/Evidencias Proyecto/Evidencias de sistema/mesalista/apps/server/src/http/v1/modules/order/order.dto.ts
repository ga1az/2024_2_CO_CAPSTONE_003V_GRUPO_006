import {
  insertOrderSchema,
  insertOrderItemWithoutIdOrderSchema,
  insertOrderRoundSchema
} from '@mesalista/database/src/schema'
import { Static, t } from 'elysia'

export const createOrderDto = t.Intersect([
  insertOrderSchema,
  t.Object({
    items: t.Array(insertOrderItemWithoutIdOrderSchema)
  })
])

export type CreateOrderDto = Static<typeof createOrderDto>

export const selectOrderDto = t.Intersect([
  insertOrderSchema,
  t.Object({
    round: t.Array(
      t.Intersect([
        insertOrderRoundSchema,
        t.Object({
          items: t.Array(insertOrderItemWithoutIdOrderSchema)
        })
      ])
    )
  })
])

export type SelectOrderDto = Static<typeof selectOrderDto>

export const getAllOrdersDto = t.Object({
  status: t.Optional(t.String()),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String())
})

export type GetAllOrdersDto = Static<typeof getAllOrdersDto>

const selectOrderItemDto = t.Object({
  idTable: t.Number(),
  idTableSession: t.Number(),
  statusRound: t.String(),
  createdAt: t.String(),
  idRound: t.Number(),
  totalAmount: t.Number()
})

const orderItemWithProductNameSchema = t.Intersect([
  insertOrderItemWithoutIdOrderSchema,
  t.Object({
    productName: t.String()
  })
])

export const selectOrderItemsDto = t.Intersect([
  selectOrderItemDto,
  t.Object({
    orderItem: t.Array(orderItemWithProductNameSchema)
  })
])

export type SelectOrderItemDto = Static<typeof selectOrderItemDto>
export type SelectOrderItemsDto = Static<typeof selectOrderItemsDto>
