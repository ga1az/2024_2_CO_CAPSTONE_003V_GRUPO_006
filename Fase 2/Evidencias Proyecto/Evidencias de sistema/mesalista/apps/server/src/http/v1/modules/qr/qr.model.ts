import {
  InsertQRSchema,
  qrTable,
  UpdateQRSchema
} from '@mesalista/database/src/schema'
import {
  generateRandomString,
  handleError,
  uploadBase64
} from '../../../../utils'
import { db, eq } from '@mesalista/database'
import {
  DatabaseError,
  NotFoundError
} from '../../../../middlewares/error.middleware'

export async function insertQR(body: InsertQRSchema, idStore: number) {
  try {
    if (body.logo) {
      body.logo = await uploadBase64(
        body.logo,
        `qr-${idStore}-${generateRandomString(5)}`
      )
    }
    const bodyWithIdStore = { ...body, idStore }
    const result = await db
      .insert(qrTable)
      .values(bodyWithIdStore)
      .returning({
        id: qrTable.id,
        createdAt: qrTable.createdAt
      })
      .then((result) => result[0])

    if (!result) {
      throw new DatabaseError('QR not created')
    }

    return result
  } catch (error) {
    handleError(error, 'insert QR')
  }
}

export async function getQRByOrgId(orgId: number) {
  try {
    const result = await db
      .select()
      .from(qrTable)
      .where(eq(qrTable.idStore, orgId))
      .then((result) => result[0])

    if (!result) {
      throw new NotFoundError('QR not found')
    }

    return result
  } catch (error) {
    handleError(error, 'get QR by org id')
  }
}

export async function updateQR(
  id: number,
  body: UpdateQRSchema,
  idStore: number
) {
  try {
    if (body.logo) {
      body.logo = await uploadBase64(
        body.logo,
        `qr-${idStore}-${generateRandomString(5)}`
      )
    }

    const result = await db
      .update(qrTable)
      .set(body)
      .where(eq(qrTable.id, id))
      .returning({
        id: qrTable.id,
        updatedAt: qrTable.updatedAt
      })
      .then((result) => result[0])

    if (!result) {
      throw new DatabaseError('QR not updated')
    }

    return result
  } catch (error) {
    handleError(error, 'update QR')
  }
}
