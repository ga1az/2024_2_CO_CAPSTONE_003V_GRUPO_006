import {
  modifierOptionTable,
  modifierProductTable,
  modifierTable,
  SelectModifierSchema
} from '@mesalista/database/src/schema'
import { CreateModifierDto, UpdateModifierOptionDto } from './modifier.dto'
import { and, db, eq, inArray } from '@mesalista/database'

export async function createModifierWithOptions(
  data: CreateModifierDto
): Promise<SelectModifierSchema> {
  try {
    const result = await db.transaction(async (trx) => {
      const result = await trx
        .insert(modifierTable)
        .values(data)
        .returning()
        .then((result) => result[0])

      if (!result.id) {
        trx.rollback()
        throw new Error('Insert modifier error')
      }

      const options = data.options.map((option) => {
        return {
          ...option,
          idModifier: result.id
        }
      })

      options.map(async (option) => {
        const result = await trx
          .insert(modifierOptionTable)
          .values(option)
          .returning()
          .then((result) => result[0])

        if (!result.id) {
          trx.rollback()
          throw new Error('Insert modifier option error')
        }
      })

      if (data.idProducts) {
        for (const idProduct of data.idProducts) {
          const resultProduct = await trx
            .insert(modifierProductTable)
            .values({ idModifier: result.id, idProduct })
            .returning()
            .then((result) => result[0])

          if (!resultProduct.id) {
            trx.rollback()
            throw new Error('Insert modifier product error')
          }
        }
      }

      return result
    })
    return result
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Failed to create modifier: ${error.message}`)
      throw new Error('Error fetching modifier', { cause: error.message })
    } else {
      throw new Error('Failed to fetch')
    }
  }
}

export async function updateModifierWithOptionsAndProducts(
  modId: number,
  data: UpdateModifierOptionDto
) {
  try {
    const result = await db.transaction(async (trx) => {
      // Update modifier basic info
      const result = await trx
        .update(modifierTable)
        .set({
          name: data.name,
          isMultipleChoice: data.isMultipleChoice,
          isRequired: data.isRequired
        })
        .where(eq(modifierTable.id, modId))
        .returning()
        .then((result) => result[0])

      if (!result.id) {
        trx.rollback()
        throw new Error('Update modifier error')
      }

      // Handle options
      if (data.options && Array.isArray(data.options)) {
        // Get existing options
        const existingOptions = await trx
          .select()
          .from(modifierOptionTable)
          .where(eq(modifierOptionTable.idModifier, modId))

        // First, handle existing options updates and collect their IDs
        const updatedOptionIds: number[] = []
        for (const option of data.options) {
          if (option.idOption) {
            // Update existing option
            await trx
              .update(modifierOptionTable)
              .set({
                name: option.name,
                overcharge: option.overcharge
              })
              .where(eq(modifierOptionTable.id, option.idOption))
              .returning()
            updatedOptionIds.push(option.idOption)
          }
        }

        // Then, create new options
        const newOptionsPromises = data.options
          .filter((option) => !option.idOption)
          .map((option) =>
            trx
              .insert(modifierOptionTable)
              .values({
                name: option.name,
                overcharge: option.overcharge,
                idModifier: modId
              })
              .returning()
          )

        await Promise.all(newOptionsPromises)

        // Delete options that are not in updatedOptionIds
        if (existingOptions.length > 0) {
          const existingIds = existingOptions.map((opt) => opt.id)
          const idsToDelete = existingIds.filter(
            (id) => !updatedOptionIds.includes(id)
          )

          if (idsToDelete.length > 0) {
            await trx
              .delete(modifierOptionTable)
              .where(
                and(
                  eq(modifierOptionTable.idModifier, modId),
                  inArray(modifierOptionTable.id, idsToDelete)
                )
              )
          }
        }
      }

      // Handle products
      if (data.products && Array.isArray(data.products)) {
        // First delete all existing product associations
        await trx
          .delete(modifierProductTable)
          .where(eq(modifierProductTable.idModifier, modId))

        // Then insert new ones
        const productPromises = data.products.map((product) =>
          trx
            .insert(modifierProductTable)
            .values({
              idModifier: modId,
              idProduct: product.idProduct
            })
            .returning()
        )

        await Promise.all(productPromises)
      }

      return result
    })

    return result
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Failed to update modifier: ${error.message}`)
      throw new Error('Error updating modifier', { cause: error.message })
    } else {
      throw new Error('Failed to update')
    }
  }
}
