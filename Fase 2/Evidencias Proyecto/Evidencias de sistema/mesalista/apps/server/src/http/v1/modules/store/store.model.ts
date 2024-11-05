import { db, eq } from '@mesalista/database'
import {
  InsertStoreSchema,
  SelectStoreSchema,
  storeTable
} from '@mesalista/database/src/schema'
import {
  DatabaseError,
  NotFoundError
} from '../../../../middlewares/error.middleware'
import {
  generateRandomString,
  handleError,
  uploadBase64
} from '../../../../utils'

// Get store by id
export async function getStoreById(
  storeId: number
): Promise<SelectStoreSchema> {
  try {
    const result = (await db.query.storeTable.findFirst({
      where: eq(storeTable.id, storeId)
    })) as SelectStoreSchema | null

    if (!result) {
      console.log(`Store with id ${storeId} not found`)
      throw new NotFoundError('Store not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch store by id')
  }
}

// Get store by slug
export async function getStoreBySlug(slug: string): Promise<SelectStoreSchema> {
  try {
    const result = (await db.query.storeTable.findFirst({
      where: eq(storeTable.slug, slug)
    })) as SelectStoreSchema | null

    if (!result) {
      console.log(`Store with slug ${slug} not found`)
      throw new NotFoundError('Store not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch store by slug')
  }
}

// Create new store
export async function createStore(
  data: InsertStoreSchema
): Promise<SelectStoreSchema> {
  try {
    if (data.bgImage) {
      data.bgImage = await uploadBase64(
        data.bgImage,
        `store-${data.id}-${generateRandomString(5)}`
      )
    }

    const result = (await db
      .insert(storeTable)
      .values(data)
      .returning()
      .then((result) => result[0])) as SelectStoreSchema

    if (!result.id) {
      console.log(
        `Failed to create store: no id returned for data ${JSON.stringify(data)}`
      )
      throw new DatabaseError('Failed to create store')
    }

    return result
  } catch (error) {
    handleError(error, 'create store')
  }
}

// Update store
export async function updateStore(
  id: number,
  data: Partial<InsertStoreSchema>
): Promise<SelectStoreSchema> {
  try {
    if (data.bgImage) {
      data.bgImage = await uploadBase64(
        data.bgImage,
        `store-${data.id}-${generateRandomString(5)}`
      )
    }

    const result = (await db
      .update(storeTable)
      .set(data)
      .where(eq(storeTable.id, id))
      .returning()
      .then((result) => result[0])) as SelectStoreSchema

    if (!result.id) {
      console.log(`Store with id ${id} not found for update`)
      throw new NotFoundError('Store not found')
    }

    return result
  } catch (error) {
    handleError(error, 'update store')
  }
}

// Get all stores
export async function getAllStores(): Promise<SelectStoreSchema[]> {
  try {
    const result = (await db.query.storeTable.findMany()) as SelectStoreSchema[]

    if (!result || result.length === 0) {
      console.log(`No stores found`)
      throw new NotFoundError('No stores found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch all stores')
  }
}

// Delete store
export async function deleteStore(id: number): Promise<number> {
  try {
    const result = await db
      .delete(storeTable)
      .where(eq(storeTable.id, id))
      .returning({ id: storeTable.id })
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Store with id ${id} not found for deletion`)
      throw new NotFoundError('Store not found')
    }

    return result.id
  } catch (error) {
    handleError(error, 'delete store')
  }
}
