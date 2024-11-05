import { and, asc, db, desc, eq } from '@mesalista/database'
import {
  SelectTableSchema,
  tableTable,
  tableSessionTable,
  InsertTableSchema,
  SelectTableSessionSchema
} from '@mesalista/database/src/schema'
import {
  DatabaseError,
  NotFoundError
} from '../../../../middlewares/error.middleware'
import { handleError } from '../../../../utils'
import { encryptJSON } from '../../../../utils/crypto'

// Get table by id
export async function getTableById(tableId: number) {
  try {
    const result = await db
      .select()
      .from(tableTable)
      .where(
        and(eq(tableTable.id, tableId), eq(tableSessionTable.status, 'active'))
      )
      .leftJoin(tableSessionTable, eq(tableSessionTable.idTable, tableTable.id))
      .then((result) => result[0])

    if (!result) {
      console.log(`Table with id ${tableId} not found`)
      throw new NotFoundError(`Table not found`)
    }

    const newResult = {
      ...result.table,
      tmpCode: result.table_session?.tmpCode
    }

    return newResult
  } catch (error) {
    handleError(error, 'fetch table by id')
  }
}

// Get table by identifier
export async function getTableByIdentifier(
  identifier: string
): Promise<SelectTableSchema> {
  try {
    const result = await db.query.tableTable.findFirst({
      where: eq(tableTable.identifier, identifier)
    })

    if (!result) {
      console.log(`Table with identifier ${identifier} not found`)
      throw new NotFoundError(`Table not found`)
    }

    return result
  } catch (error) {
    handleError(error, 'fetch table by identifier')
  }
}

// Create new table
export async function createTable(
  data: InsertTableSchema
): Promise<SelectTableSchema> {
  try {
    const result = await db
      .insert(tableTable)
      .values(data)
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      throw new DatabaseError('Failed to create table')
    }

    const qrCodeData = encryptJSON({
      tableId: result.id,
      identifier: result.identifier,
      idStore: result.idStore
    })

    const updatedResult = await db
      .update(tableTable)
      .set({
        qrCode: qrCodeData
      })
      .where(eq(tableTable.id, result.id))
      .returning()
      .then((result) => result[0])

    return updatedResult
  } catch (error) {
    handleError(error, 'create table')
  }
}

// Update table
export async function updateTable(
  id: number,
  data: Partial<InsertTableSchema>
): Promise<SelectTableSchema> {
  try {
    if (data.isDeleted === true) {
      const randomId = `deleted_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`
      data.identifier = randomId
    }
    const result = await db
      .update(tableTable)
      .set(data)
      .where(eq(tableTable.id, id))
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Table with id ${id} not found for update`)
      throw new NotFoundError(`Table not found for update`)
    }

    return result
  } catch (error) {
    handleError(error, 'update table')
  }
}

// Delete table
export async function deleteTable(id: number): Promise<number> {
  try {
    const result = await db
      .delete(tableTable)
      .where(eq(tableTable.id, id))
      .returning({ id: tableTable.id })
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Table with id ${id} not found for deletion`)
      throw new NotFoundError(`Table not found for deletion`)
    }

    return result.id
  } catch (error) {
    handleError(error, 'delete table')
  }
}

// Get session table by id
export async function getTableSessionById(
  tableSessionId: number
): Promise<SelectTableSessionSchema> {
  try {
    const result = await db.query.tableSessionTable.findFirst({
      where: eq(tableSessionTable.id, tableSessionId)
    })

    if (!result) {
      console.log(`Table session with id ${tableSessionId} not found`)
      throw new NotFoundError(`Table session not found`)
    }

    return result as SelectTableSessionSchema
  } catch (error) {
    handleError(error, 'fetch table session by id')
  }
}

// Get session table by session token
export async function getTableSessionBySessionToken(
  sessionToken: string
): Promise<SelectTableSessionSchema> {
  try {
    const result = await db.query.tableSessionTable.findFirst({
      where: eq(tableSessionTable.sessionToken, sessionToken)
    })

    if (!result) {
      console.log(`Table session with token ${sessionToken} not found`)
      throw new NotFoundError(`Table session not found`)
    }

    return result as SelectTableSessionSchema
  } catch (error) {
    handleError(error, 'fetch table session by session token')
  }
}

// Delete table session
export async function deleteTableSession(id: number): Promise<number> {
  try {
    const result = await db
      .delete(tableSessionTable)
      .where(eq(tableSessionTable.id, id))
      .returning({ id: tableSessionTable.id })
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Table session with id ${id} not found for deletion`)
      throw new NotFoundError(`Table session not found for deletion`)
    }

    return result.id
  } catch (error) {
    handleError(error, 'delete table session')
  }
}

// Get all table sessions by table id
export async function getAllTableSessionsByTableId(
  tableId: number,
  ascBySort: boolean = true
): Promise<SelectTableSessionSchema[]> {
  try {
    const orderBy = () => {
      const query = ascBySort
        ? asc(tableSessionTable.createdAt)
        : desc(tableSessionTable.createdAt)
      return query
    }
    const result = await db
      .select()
      .from(tableSessionTable)
      .where(eq(tableSessionTable.idTable, tableId))
      .orderBy(orderBy)
      .then((result) => result)

    if (!result || result.length === 0) {
      console.log(`No table sessions found for table id ${tableId}`)
      throw new NotFoundError(`No table sessions found for table`)
    }

    return result as SelectTableSessionSchema[]
  } catch (error) {
    handleError(error, 'fetch all table sessions by table id')
  }
}

// Get all tables by store id
export async function getAllTablesByStoreId(
  storeId: number
): Promise<SelectTableSchema[]> {
  try {
    const result = await db
      .select()
      .from(tableTable)
      .where(
        and(eq(tableTable.idStore, storeId), eq(tableTable.isDeleted, false))
      )
      .then((result) => result)

    if (!result || result.length === 0) {
      console.log(`No tables found for store id ${storeId}`)
      throw new NotFoundError(`No tables found for store`)
    }

    return result
  } catch (error) {
    handleError(error, 'fetch all tables by store id')
  }
}

// Create a new QR code for a table
export async function createQRCodeForTable(tableId: number) {
  try {
    const table = await getTableById(tableId)

    if (!table) {
      console.log(`Table with id ${tableId} not found`)
      throw new NotFoundError(`Table not found`)
    }

    const qrCodeData = encryptJSON({
      tableId: table.id,
      identifier: table.identifier
    })

    await db
      .update(tableTable)
      .set({
        qrCode: qrCodeData
      })
      .where(eq(tableTable.id, tableId))

    return qrCodeData
  } catch (error) {
    handleError(error, 'create QR code for table')
  }
}
