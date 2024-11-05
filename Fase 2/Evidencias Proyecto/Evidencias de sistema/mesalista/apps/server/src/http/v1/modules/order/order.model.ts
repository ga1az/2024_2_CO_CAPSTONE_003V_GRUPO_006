import { db, eq, sql } from '@mesalista/database'
import {
  RoundStatus,
  SelectOrderInfoModifiers,
  SelectOrderItemModifierSchema,
  SelectOrderItemSchema,
  SelectOrderSchema,
  orderItemModifierTable,
  orderItemTable,
  orderRoundTable,
  orderTable,
  productTable
} from '@mesalista/database/src/schema'
import { NotFoundError } from '../../../../middlewares/error.middleware'
import { handleError } from '../../../../utils'

// Get order by id
export async function getOrderById(
  orderId: number
): Promise<SelectOrderSchema> {
  try {
    const result = await db.query.orderTable.findFirst({
      where: eq(orderTable.id, orderId)
    })

    if (!result) {
      console.log(`Order with id ${orderId} not found`)
      throw new NotFoundError('Order not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch order by id')
  }
}

// Get Order by table session id
export async function getOrderByTableSessionId(
  tableSessionId: number
): Promise<SelectOrderSchema> {
  try {
    const result = await db.query.orderTable.findFirst({
      where: eq(orderTable.idTableSession, tableSessionId)
    })

    if (!result) {
      console.log(`Order with table session id ${tableSessionId} not found`)
      throw new NotFoundError('Order not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch order by table session id')
  }
}

// Get order Item by order id
export async function getOrderItemByOrderId(
  orderId: number
): Promise<SelectOrderItemSchema[]> {
  try {
    const result = await db
      .select()
      .from(orderItemTable)
      .innerJoin(
        orderRoundTable,
        eq(orderItemTable.idRound, orderRoundTable.id)
      )
      .where(eq(orderRoundTable.idOrder, orderId))

    if (!result || result.length === 0) {
      console.log(`Order items for order id ${orderId} not found`)
      throw new NotFoundError('Order items not found')
    }

    const newResult = result.map((row) => ({
      ...row.order_item,
      round: row.order_round
    }))

    return newResult
  } catch (error) {
    handleError(error, 'fetch order item by order id')
  }
}

// Update round status
export async function updateRoundStatus(roundId: number, status: RoundStatus) {
  try {
    await db
      .update(orderRoundTable)
      .set({ status })
      .where(eq(orderRoundTable.id, roundId))

    return true
  } catch (error) {
    handleError(error, 'update round status')
  }
}

// Get detailed information with round id, all information about the order and the items
export async function getDetailedInformation(roundId: number) {
  try {
    const result = await db
      .select({
        orderId: orderRoundTable.idOrder,
        orderItemId: orderItemTable.idProduct,
        quantity: orderItemTable.quantity,
        productName: productTable.name,
        productDescription: productTable.description,
        notes: orderItemTable.notes,
        modifiersName: orderItemModifierTable.name,
        modifiersPrice: orderItemModifierTable.price
      })
      .from(orderRoundTable)
      .innerJoin(orderTable, eq(orderRoundTable.idOrder, orderTable.id))
      .innerJoin(orderItemTable, eq(orderRoundTable.id, orderItemTable.idRound))
      .innerJoin(productTable, eq(orderItemTable.idProduct, productTable.id))
      .leftJoin(
        orderItemModifierTable,
        eq(orderItemTable.id, orderItemModifierTable.idOrderItem)
      )
      .where(eq(orderRoundTable.id, roundId))

    const transformedResult: SelectOrderInfoModifiers[] = Object.values(
      result.reduce(
        (acc, item) => {
          // Object to group the order items by orderItemId
          if (!acc[item.orderItemId]) {
            acc[item.orderItemId] = {
              orderId: item.orderId,
              orderItemId: item.orderItemId,
              quantity: item.quantity,
              productName: item.productName,
              productDescription: item.productDescription,
              notes: item.notes,
              modifiers: [] // Array to store the modifiers
            }
          }

          // Only add the modifier if the name and price are not null
          if (item.modifiersName !== null && item.modifiersPrice !== null) {
            acc[item.orderItemId].modifiers.push({
              name: item.modifiersName,
              price: item.modifiersPrice
            })
          }

          // If there are no modifiers, set the modifiers to null
          if (acc[item.orderItemId].modifiers.length === 0) {
            acc[item.orderItemId].modifiers = null
          }

          return acc
        },
        {} as Record<number, any>
      )
    )

    return transformedResult
  } catch (error) {
    handleError(error, 'get detailed information')
  }
}
