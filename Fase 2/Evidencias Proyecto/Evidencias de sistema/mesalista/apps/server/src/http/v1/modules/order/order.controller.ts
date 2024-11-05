import { Elysia, t } from 'elysia'
import {
  getDetailedInformation,
  getOrderById,
  getOrderByTableSessionId,
  getOrderItemByOrderId,
  updateRoundStatus
} from './order.model'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import { SwaggerResponses } from '../../../../utils'
import {
  createOrderDto,
  selectOrderDto,
  selectOrderItemsDto
} from './order.dto'
import { createOrder, getAllOrderItems, getAllOrders } from './order.service'
import {
  roundStatus,
  selectOrderInfoModifiers,
  selectOrderItemSchema,
  selectOrderSchema
} from '@mesalista/database/src/schema'

export const OrderController = new Elysia({ prefix: '/order' })
  .use(isAuthenticated)
  .model({
    createOrder: createOrderDto,
    roundStatus: t.Object({
      status: roundStatus
    })
  })

  // Get order by id
  .get(
    '/:id',
    async function handler({ params }) {
      const result = await getOrderById(params.id)

      return {
        status: 200,
        message: 'Order found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Order'],
        responses: SwaggerResponses(selectOrderSchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get order by table session id
  .get(
    '/table/:tableSessionId',
    async function handler({ params }) {
      const result = await getOrderByTableSessionId(params.tableSessionId)

      return {
        status: 200,
        message: 'Order found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Order'],
        responses: SwaggerResponses(selectOrderSchema)
      },
      params: t.Object({ tableSessionId: t.Number() })
    }
  )

  // Get order item by order id
  .get(
    '/item/:orderId',
    async function handler({ params }) {
      const result = await getOrderItemByOrderId(params.orderId)

      return {
        status: 200,
        message: 'Order item found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Order'],
        responses: SwaggerResponses(t.Array(selectOrderItemSchema))
      },
      params: t.Object({ orderId: t.Number() })
    }
  )

  // Create new order
  .post(
    '',
    async function handler({ body }) {
      const result = await createOrder(body)

      return {
        status: 201,
        message: 'Order created',
        data: result
      }
    },
    {
      detail: {
        tags: ['Order'],
        responses: SwaggerResponses(createOrderDto)
      },
      body: 'createOrder'
    }
  )

  // Get all order with filters and pagination
  // filter by status
  // filter by date
  .get(
    '/all',
    async function handler({ query, payload }) {
      const result = await getAllOrders(query, payload.store)

      return {
        status: 200,
        message: 'Orders found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Order'],
        responses: SwaggerResponses(t.Array(selectOrderDto))
      },
      query: t.Object({
        status: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String())
      })
    }
  )

  // Get all order item with filters
  .get(
    '/item/all',
    async function handler({ query, payload }) {
      const result = await getAllOrderItems(query, payload.store)

      return {
        status: 200,
        message: 'Order items found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Order'],
        responses: SwaggerResponses(t.Array(selectOrderItemsDto))
      },
      query: t.Object({
        status: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String())
      })
    }
  )

  // Update round status
  .put(
    '/round/:roundId',
    async function handler({ params, body }) {
      const result = await updateRoundStatus(params.roundId, body.status)

      return {
        status: 200,
        message: 'Round status updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Order'],
        responses: SwaggerResponses(t.Boolean())
      },
      params: t.Object({ roundId: t.Number() }),
      body: 'roundStatus'
    }
  )

  // Get detailed information of order round
  .get(
    '/round/detail/:roundId',
    async function handler({ params }) {
      const result = await getDetailedInformation(params.roundId)

      return {
        status: 200,
        message: 'Order round detail found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Order'],
        responses: SwaggerResponses(t.Array(selectOrderInfoModifiers))
      },
      params: t.Object({ roundId: t.Number() })
    }
  )
