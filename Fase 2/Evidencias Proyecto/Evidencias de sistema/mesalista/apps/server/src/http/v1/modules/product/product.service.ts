import {
  InsertProductPriceSchema,
  InsertProductSchema,
  productPriceTable,
  productTable,
  ProductWithPriceSchema
} from '@mesalista/database/src/schema'
import { db } from '@mesalista/database'
import {
  DatabaseError,
  NotFoundError
} from '../../../../middlewares/error.middleware'
import { generateRandomString, uploadBase64 } from '../../../../utils'

export async function createNewProductWithPrice(
  product: InsertProductSchema,
  price: number,
  storeId: number
): Promise<ProductWithPriceSchema> {
  try {
    const transaction = await db.transaction(async (trx) => {
      if (product.bgImage) {
        product.bgImage = await uploadBase64(
          product.bgImage,
          `product-${storeId}-${generateRandomString(5)}`
        )
      }
      const resultProduct = await trx
        .insert(productTable)
        .values(product)
        .returning()
        .then((result) => result[0])

      if (!resultProduct.id) {
        trx.rollback()
      }

      const updatedPrice = {
        price,
        idProduct: resultProduct.id
      }

      const resultPrice = await trx
        .insert(productPriceTable)
        .values(updatedPrice)
        .returning()
        .then((result) => result[0])

      if (!resultPrice.id) {
        trx.rollback()
      }

      return {
        ...resultProduct,
        price: resultPrice
      }
    })
    return transaction
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    } else if (error instanceof Error) {
      console.log(`Failed to fetch product: ${error.message}`)
      throw new DatabaseError(`Failed to fetch product: ${error.message}`)
    } else {
      console.log(`Unexpected error while fetching product: ${error}`)
      throw new DatabaseError('Unexpected error while fetching product')
    }
  }
}
