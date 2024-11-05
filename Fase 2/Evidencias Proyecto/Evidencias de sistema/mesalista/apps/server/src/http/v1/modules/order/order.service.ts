import {
  and,
  db,
  eq,
  gte,
  inArray,
  lte,
  notInArray,
  sql
} from '@mesalista/database'
import {
  CreateOrderDto,
  GetAllOrdersDto,
  SelectOrderDto,
  SelectOrderItemDto,
  SelectOrderItemsDto
} from './order.dto'
import {
  orderItemTable,
  orderRoundTable,
  orderTable,
  productTable
} from '@mesalista/database/src/schema'
import { handleError } from '../../../../utils'
import { NotFoundError } from '../../../../middlewares/error.middleware'

// Create new order with items
export async function createOrder(
  data: CreateOrderDto
): Promise<CreateOrderDto> {
  try {
    const transaction = await db.transaction(async (trx) => {
      const resultProduct = await trx
        .insert(orderTable)
        .values(data)
        .returning()
        .then((result) => result[0])

      if (!resultProduct.id) {
        trx.rollback()
        throw new Error('Failed to create order: no id returned')
      }

      // Consult table order round if exist and the status is not delivered or cancelled
      let roundOrder = await trx
        .select()
        .from(orderRoundTable)
        .where(
          and(
            eq(orderRoundTable.idOrder, resultProduct.id),
            notInArray(orderRoundTable.status, ['delivered', 'cancelled'])
          )
        )
        .then((result) => result[0])

      if (!roundOrder.id) {
        roundOrder = await trx
          .insert(orderRoundTable)
          .values({
            idOrder: resultProduct.id
          })
          .returning()
          .then((result) => result[0])

        if (!roundOrder.id) {
          trx.rollback()
          throw new Error('Failed to create order round: no id returned')
        }
      }

      const options = await data.items.map(async (item) => {
        const productName = await trx
          .select()
          .from(productTable)
          .where(eq(productTable.id, item.idProduct))
          .then((result) => result[0].name)

        if (!productName) {
          trx.rollback()
          throw new Error('Failed to get product name')
        }

        const newItem = {
          ...item,
          idOrder: resultProduct.id,
          idRound: roundOrder.id,
          productName: productName
        }
        const resultItem = await trx
          .insert(orderItemTable)
          .values(newItem)
          .returning()
          .then((result) => result[0])

        if (!resultItem.id) {
          trx.rollback()
          throw new Error('Failed to create order item: no id returned')
        }

        return resultItem
      })

      return {
        ...resultProduct,
        items: await Promise.all(options)
      }
    })

    return transaction
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Failed to create order: ${error.message}`)
      throw new Error('Failed to create order:', { cause: error.message })
    } else {
      throw new Error('Failed to create order')
    }
  }
}

export async function getAllOrders(
  query: GetAllOrdersDto,
  store: number
): Promise<SelectOrderDto[]> {
  try {
    // Obtain the orders
    const orders = await db
      .select()
      .from(orderTable)
      .where(
        and(
          eq(orderTable.idStore, store),
          query.startDate
            ? gte(orderTable.createdAt, new Date(query.startDate))
            : undefined,
          query.endDate
            ? lte(orderTable.createdAt, new Date(query.endDate))
            : undefined
        )
      )

    if (orders.length === 0) {
      throw new NotFoundError('No orders found')
    }

    // Get all rounds for these orders in a single query
    const rounds = await db
      .select()
      .from(orderRoundTable)
      .where(
        and(
          inArray(
            orderRoundTable.idOrder,
            orders.map((order) => order.id)
          ),
          query.status
            ? eq(
                orderRoundTable.status,
                query.status as
                  | 'cancelled'
                  | 'pending'
                  | 'in_progress'
                  | 'delivered'
              )
            : undefined,
          query.startDate
            ? gte(orderRoundTable.createdAt, new Date(query.startDate))
            : undefined,
          query.endDate
            ? lte(orderRoundTable.createdAt, new Date(query.endDate))
            : undefined
        )
      )

    // Get all items for these rounds in a single query
    const items = await db
      .select()
      .from(orderItemTable)
      .where(
        inArray(
          orderItemTable.idRound,
          rounds.map((round) => round.id)
        )
      )

    // Map the data structure
    const resultOrders: SelectOrderDto[] = orders.map((order) => ({
      ...order,
      round: rounds
        .filter((round) => round.idOrder === order.id)
        .map((round) => ({
          ...round,
          items: items.filter((item) => item.idRound === round.id)
        }))
    }))

    return resultOrders
  } catch (error) {
    handleError(error, 'get all orders')
  }
}

export async function getAllOrderItems(
  query: GetAllOrdersDto,
  store: number
): Promise<SelectOrderItemsDto[]> {
  try {
    const items = await db
      .select({
        idTable: orderTable.id,
        idTableSession: orderTable.idTableSession,
        statusRound: orderRoundTable.status,
        createdAt: orderRoundTable.createdAt,
        idRound: orderRoundTable.id,
        orderItem: orderItemTable,
        product: productTable
      })
      .from(orderTable)
      .innerJoin(orderRoundTable, eq(orderTable.id, orderRoundTable.idOrder))
      .innerJoin(orderItemTable, eq(orderRoundTable.id, orderItemTable.idRound))
      .innerJoin(productTable, eq(orderItemTable.idProduct, productTable.id))
      .where(
        and(
          eq(orderTable.idStore, store),
          query.status
            ? eq(
                orderRoundTable.status,
                query.status as
                  | 'cancelled'
                  | 'pending'
                  | 'in_progress'
                  | 'delivered'
              )
            : undefined,
          query.startDate
            ? gte(orderRoundTable.createdAt, new Date(query.startDate))
            : undefined,
          query.endDate
            ? lte(orderRoundTable.createdAt, new Date(query.endDate))
            : undefined
        )
      )
      .groupBy(
        orderTable.idTableSession,
        orderRoundTable.status,
        orderItemTable.id,
        orderTable.id,
        productTable.id,
        orderRoundTable.id
      )

    const transformedItems: SelectOrderItemsDto[] = items.reduce(
      (acc: any[], current) => {
        // Crear el objeto orderItem con el nombre del producto incluido
        const orderItemWithProduct = {
          ...current.orderItem,
          productName: current.product.name
        }

        // Buscar si ya existe un grupo con el mismo idRound
        const existingGroup = acc.find(
          (group) => group.idRound === current.idRound
        )

        if (existingGroup) {
          // Si existe, agregar el orderItem al array existente
          existingGroup.orderItem.push(orderItemWithProduct)
          // Recalcular el totalAmount sumando todos los subtotales
          existingGroup.totalAmount = existingGroup.orderItem
            .reduce((sum: number, item: any) => sum + item.subtotal, 0)
            .toString()
        } else {
          // Si no existe, crear un nuevo grupo
          acc.push({
            idTable: current.idTable,
            idTableSession: current.idTableSession,
            statusRound: current.statusRound,
            createdAt: current.createdAt,
            idRound: current.idRound,
            totalAmount: current.orderItem.subtotal,
            orderItem: [orderItemWithProduct]
          })
        }

        return acc
      },
      []
    )

    return transformedItems
  } catch (error) {
    handleError(error, 'get all order items')
  }
}
