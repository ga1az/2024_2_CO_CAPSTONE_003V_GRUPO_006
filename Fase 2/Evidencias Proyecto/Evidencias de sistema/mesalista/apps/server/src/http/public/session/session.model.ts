import { and, db, desc, eq, redis } from '@mesalista/database'
import {
  CartSchema,
  InsertTableSessionSchema,
  SelectTableSessionSchema,
  tableSessionTable,
  tableTable
} from '@mesalista/database/src/schema'
import {
  DatabaseError,
  NotFoundError
} from '../../../middlewares/error.middleware'
import {
  generateRandomNumberLength,
  handleError,
  QrCodeSchema
} from '../../../utils'
import { decryptJSON } from '../../../utils/crypto'

// Create new table session
export async function createTableSession(
  qrCode: string
): Promise<SelectTableSessionSchema> {
  try {
    const decryptedQrCode: QrCodeSchema = await decryptJSON(qrCode)
    const createTmpCode = generateRandomNumberLength(6)

    const result = await db
      .insert(tableSessionTable)
      .values({
        idTable: decryptedQrCode.tableId,
        tmpCode: createTmpCode
      })
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Failed to create table session: no id returned`)
      throw new DatabaseError('Failed to create table session')
    }

    return result as SelectTableSessionSchema
  } catch (error) {
    handleError(error, 'create table session')
  }
}

// Update table session
export async function updateTableSession(
  id: number,
  data: Partial<InsertTableSessionSchema>
): Promise<SelectTableSessionSchema> {
  try {
    const result = await db
      .update(tableSessionTable)
      .set(data)
      .where(eq(tableSessionTable.id, id))
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Table session with id ${id} not found for update`)
      throw new NotFoundError(`Table session not found for update`)
    }

    return result as SelectTableSessionSchema
  } catch (error) {
    handleError(error, 'update table session')
  }
}

export async function validateQRCode(qrCode: string) {
  try {
    const result = await db
      .select()
      .from(tableTable)
      .where(eq(tableTable.qrCode, qrCode))
      .then((result) => result[0])

    if (!result) {
      return false
    }

    return result.qrCode === qrCode
  } catch (error) {
    return false
  }
}

export async function findActiveSession(
  qrCode: string
): Promise<number | null> {
  try {
    const result = await db
      .select()
      .from(tableSessionTable)
      .where(
        and(
          eq(tableTable.qrCode, qrCode),
          eq(tableSessionTable.status, 'active')
        )
      )
      .innerJoin(tableTable, eq(tableSessionTable.idTable, tableTable.id))
      .orderBy(desc(tableSessionTable.createdAt))
      .then((result) => result[0] || null)

    // Verificamos si hay resultado antes de acceder a table_session
    return result?.table_session?.id || null
  } catch (error) {
    handleError(error, 'find active session')
  }
}

// En session.model.ts
export async function validateSessionCode(
  sessionId: number,
  code: string
): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(tableSessionTable)
      .where(
        and(
          eq(tableSessionTable.id, sessionId),
          eq(tableSessionTable.tmpCode, code),
          eq(tableSessionTable.status, 'active')
        )
      )
      .then((result) => result[0] || null)

    return !!result
  } catch (error) {
    handleError(error, 'validate session code')
  }
}

// Get session by qrCode and tmpCode
export async function getSessionByQRCodeAndTmpCode(
  qrCode: string,
  tmpCode: string
): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(tableSessionTable)
      .innerJoin(tableTable, eq(tableSessionTable.idTable, tableTable.id))
      .where(
        and(
          eq(tableTable.qrCode, qrCode),
          eq(tableSessionTable.tmpCode, tmpCode)
        )
      )
      .then((result) => result[0])

    if (!result) {
      console.log(
        `Session not found for QR code ${qrCode} and tmp code ${tmpCode}`
      )
      throw new NotFoundError('Session not found')
    }

    return true
  } catch (error) {
    handleError(error, 'fetch session by QR code and tmp code')
  }
}

// Get cart in redis, verify the qrCode and tmpCode
export async function getCartByQRCodeAndTmpCodeIn(
  qrCode: string,
  tmpCode: string
): Promise<CartSchema> {
  try {
    const isValid = await getSessionByQRCodeAndTmpCode(qrCode, tmpCode)
    if (!isValid) {
      throw new NotFoundError('Session not found')
    }

    const cart: CartSchema | null = await redis.hgetall(tmpCode)
    if (!cart) {
      throw new NotFoundError('Cart not found')
    }

    return cart
  } catch (error) {
    handleError(error, 'fetch cart by QR code and tmp code')
  }
}

export async function createCartInRedis(
  qrCode: string,
  tmpCode: string,
  cart: any
): Promise<any> {
  try {
    const isValid = await getSessionByQRCodeAndTmpCode(qrCode, tmpCode)
    if (!isValid) {
      throw new NotFoundError('Session not found')
    }

    const cartExists = await redis.hexists(tmpCode, 'id')
    if (cartExists) {
      throw new Error('Cart already exists')
    }

    await redis.hset(tmpCode, cart)
  } catch (error) {
    handleError(error, 'create cart in redis')
  }
}
