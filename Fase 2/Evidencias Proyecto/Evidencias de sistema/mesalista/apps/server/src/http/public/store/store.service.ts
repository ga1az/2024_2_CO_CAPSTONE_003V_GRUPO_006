import { db, eq, sql } from '@mesalista/database'
import { handleError, PaginationParams } from '../../../utils'
import { storeTable } from '@mesalista/database/src/schema'
import { NotFoundError } from '../../../middlewares/error.middleware'

const tableProduct = 'product'
const tableModifier = 'modifier'
const tableModifierOption = 'modifier_option'
const tableModifierProduct = 'modifier_product'
const tableCategory = 'category'
const tableProductPrice = 'product_price'

interface ExtendedPaginationParams extends PaginationParams {
  orderBy?: string
}

export async function getAllInfoByStoreId(storeId: number) {
  try {
    const storeInfo = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.id, storeId))
      .then((result) => result[0])

    if (!storeInfo) {
      throw new NotFoundError('Store not found')
    }

    const baseQuery = sql.raw(`
              SELECT
            ${tableCategory}.*,
            json_agg(
                jsonb_build_object(
                    'id', ${tableProduct}.id,
                    'name', ${tableProduct}.name,
                    'description', ${tableProduct}.description,
                    'price', ${tableProductPrice}.price,
                    'bgImage', ${tableProduct}.bg_image,
                    'modifiers', mod.modifiers
                ) ORDER BY ${tableProduct}.sort DESC
            ) FILTER (WHERE ${tableProduct}.id IS NOT NULL) as products
        FROM ${tableCategory}
        LEFT JOIN ${tableProduct} ON ${tableCategory}.id = ${tableProduct}.id_category
        LEFT JOIN ${tableProductPrice} ON ${tableProduct}.id = ${tableProductPrice}.id_product
        LEFT JOIN (
            SELECT
                mp.id_product,
                json_agg(
                    DISTINCT jsonb_build_object(
                        'id', m.id,
                        'name', m.name,
                        'isRequired', m.is_required,
                        'isMultiple', m.is_multiple_choice,
                        'options', mo.options
                    )
                ) as modifiers
            FROM ${tableModifier} m
            JOIN ${tableModifierProduct} mp ON m.id = mp.id_modifier
            LEFT JOIN (
                SELECT
                    mo.id_modifier,
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', mo.id,
                            'name', mo.name,
                            'overcharge', mo.overcharge
                        )
                    ) as options
                FROM ${tableModifierOption} mo
                GROUP BY mo.id_modifier
            ) mo ON mo.id_modifier = m.id
            GROUP BY mp.id_product
        ) mod ON ${tableProduct}.id = mod.id_product
        WHERE ${tableCategory}.id_store = ${storeId}
        GROUP BY ${tableCategory}.id
        ORDER BY ${tableCategory}.sort DESC
    `)

    const result = await db.execute(baseQuery)

    const parsedResult = {
      ...storeInfo,
      items: result
    }

    return parsedResult
  } catch (error) {
    handleError(error, 'get all info by store id')
  }
}

export async function getAllStores() {
  try {
    const stores = await db
      .select({
        id: storeTable.id,
        name: storeTable.name,
        slug: storeTable.slug,
        desc: storeTable.desc,
        bgImage: storeTable.bgImage,
        isActive: storeTable.isActive
      })
      .from(storeTable)
      .orderBy(storeTable.name)

    return stores
  } catch (error) {
    handleError(error, 'get all stores')
  }
}
