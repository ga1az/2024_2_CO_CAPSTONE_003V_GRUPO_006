import { db, eq, sql } from '@mesalista/database'
import {
  InsertModifierOptionSchema,
  InsertModifierProductSchema,
  InsertModifierSchema,
  SelectModifierOptionSchema,
  SelectModifierProductSchema,
  SelectModifierResponseSchema,
  SelectModifierSchema,
  modifierOptionTable,
  modifierProductTable,
  modifierTable
} from '@mesalista/database/src/schema'
import {
  DatabaseError,
  NotFoundError
} from '../../../../middlewares/error.middleware'
import {
  buildPaginationUrls,
  camelToSnakeCase,
  getWhereClause,
  handleError,
  AdvancedFilters,
  PaginationParams,
  PaginationResult
} from '../../../../utils'
import { BulkUpdateModifierDTO } from './modifier.dto'

const tableName = 'modifier'
const tableOption = 'modifier_option'
const tableModifierProduct = 'modifier_product'
const tableProduct = 'product'

// Create new modifier
export async function createModifier(
  data: InsertModifierSchema
): Promise<SelectModifierSchema> {
  try {
    const result = await db
      .insert(modifierTable)
      .values(data)
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(
        `Failed to create modifier with data: ${JSON.stringify(data)}`
      )
      throw new DatabaseError('Failed to create modifier')
    }
    return result
  } catch (error) {
    handleError(error, 'create modifier')
  }
}

// Create new modifierOption
export async function createModifierOption(
  data: InsertModifierOptionSchema
): Promise<SelectModifierOptionSchema> {
  try {
    const result = await db
      .insert(modifierOptionTable)
      .values(data)
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(
        `Failed to create modifier option with data: ${JSON.stringify(data)}`
      )
      throw new DatabaseError('Failed to create modifier option')
    }
    return result
  } catch (error) {
    handleError(error, 'create modifier option')
  }
}

// Create new modifierProduct
export async function createModifierProduct(
  data: InsertModifierProductSchema
): Promise<SelectModifierProductSchema> {
  try {
    const result = await db
      .insert(modifierProductTable)
      .values(data)
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(
        `Failed to create modifier product with data: ${JSON.stringify(data)}`
      )
      throw new DatabaseError('Failed to create modifier product')
    }
    return result
  } catch (error) {
    handleError(error, 'create modifier product')
  }
}

// Update modifier
export async function updateModifier(
  id: number,
  data: Partial<InsertModifierSchema>
): Promise<SelectModifierSchema> {
  try {
    const result = await db
      .update(modifierTable)
      .set(data)
      .where(eq(modifierTable.id, id))
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Modifier with id ${id} not found for update`)
      throw new NotFoundError('Modifier not found')
    }

    return result
  } catch (error) {
    handleError(error, `update modifier with id ${id}`)
  }
}

// Update modifierOption
export async function updateModifierOption(
  id: number,
  data: Partial<InsertModifierOptionSchema>
): Promise<SelectModifierOptionSchema> {
  try {
    const result = await db
      .update(modifierOptionTable)
      .set(data)
      .where(eq(modifierOptionTable.id, id))
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Modifier option with id ${id} not found for update`)
      throw new NotFoundError('Modifier option not found')
    }

    return result
  } catch (error) {
    handleError(error, `update modifier option with id ${id}`)
  }
}

// Delete modifierOption
export async function deleteModifierOption(id: number): Promise<number> {
  try {
    const result = await db
      .delete(modifierOptionTable)
      .where(eq(modifierOptionTable.id, id))
      .returning({ id: modifierOptionTable.id })
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Modifier option with id ${id} not found for deletion`)
      throw new NotFoundError('Modifier option not found')
    }

    return result.id
  } catch (error) {
    handleError(error, `delete modifier option with id ${id}`)
  }
}

// Delete modifier
export async function deleteModifier(id: number): Promise<number> {
  try {
    const result = await db.transaction(async (trx) => {
      // First, delete all related modifier_product records
      await trx
        .delete(modifierProductTable)
        .where(eq(modifierProductTable.idModifier, id))

      // Then, delete all related modifier_option records
      await trx
        .delete(modifierOptionTable)
        .where(eq(modifierOptionTable.idModifier, id))

      // Finally, delete the modifier itself
      const result = await trx
        .delete(modifierTable)
        .where(eq(modifierTable.id, id))
        .returning({ id: modifierTable.id })
        .then((result) => result[0])

      if (!result?.id) {
        trx.rollback()
        throw new NotFoundError('Modifier not found')
      }

      return result.id
    })

    return result
  } catch (error) {
    handleError(error, `delete modifier with id ${id}`)
  }
}

// Delete modifierProduct
export async function deleteModifierProduct(id: number): Promise<number> {
  try {
    const result = await db
      .delete(modifierProductTable)
      .where(eq(modifierProductTable.id, id))
      .returning({ id: modifierProductTable.id })
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Modifier product with id ${id} not found for deletion`)
      throw new NotFoundError('Modifier product not found')
    }

    return result.id
  } catch (error) {
    handleError(error, 'delete modifier product')
  }
}

export async function getModifiers(
  storeId: number,
  params: PaginationParams,
  baseUrl: string,
  advancedFilters?: AdvancedFilters
): Promise<PaginationResult<SelectModifierResponseSchema>> {
  try {
    const { select, conditions, having, orderBy } = buildQueryParts(
      storeId,
      advancedFilters
    )

    const baseQuery = `
      FROM ${tableName}
      JOIN ${tableOption} ON ${tableName}.id = ${tableOption}.id_modifier
      LEFT JOIN ${tableModifierProduct} ON ${tableName}.id = ${tableModifierProduct}.id_modifier
      LEFT JOIN ${tableProduct} ON ${tableModifierProduct}.id_product = ${tableProduct}.id
      ${conditions}
      GROUP BY ${tableName}.id
    `

    const countQuery = sql.raw(`
      SELECT COUNT(DISTINCT ${tableName}.id) as count
      ${baseQuery.replace(/GROUP BY.*$/m, '')}
    `)

    // ${baseQuery.replace(/\s*GROUP BY[\s\S]*?(?=ORDER BY|$)/i, '')}

    const mainQuery = sql.raw(`
      SELECT ${select}
      ${baseQuery}
      ${having}
      ${orderBy}
      LIMIT ${params.pageSize}
      OFFSET ${params.pageSize * (params.page - 1)}
    `)

    const [totalItemsResult, result] = await Promise.all([
      db.execute(countQuery),
      db.execute(mainQuery)
    ])

    if (!totalItemsResult?.[0] || !result?.length) {
      throw new NotFoundError('No modifiers found')
    }

    const totalItems = Number(totalItemsResult[0].count)
    const { next, prev } = buildPaginationUrls(
      baseUrl,
      params,
      totalItems,
      result.length,
      advancedFilters
    )

    const dataResult = result.map(mapModifierResult)

    return {
      data: dataResult,
      next,
      prev,
      totalItems,
      currentItems: result.length
    }
  } catch (error) {
    handleError(error, 'fetch modifiers')
  }
}

function buildQueryParts(storeId: number, advancedFilters?: AdvancedFilters) {
  const filters = {
    ...advancedFilters?.filters,
    idStore: { operator: 'eq', value: storeId }
  }

  let select = `
    ${tableName}.*,
    json_agg(DISTINCT jsonb_build_object(
      'name', ${tableOption}.name,
      'overcharge', ${tableOption}.overcharge,
      'idOption', ${tableOption}.id
    )) as options,
    json_agg(DISTINCT jsonb_build_object(
      'name', ${tableProduct}.name,
      'idProduct', ${tableProduct}.id
    )) FILTER (WHERE ${tableProduct}.name IS NOT NULL) as products
  `
  let conditions = ''
  let having = ''
  let orderBy = ''

  if (advancedFilters) {
    if (advancedFilters.select?.length) {
      select = advancedFilters.select
        .map((column) => getTableColumnName(column, true))
        .join(',')
    }

    const { filterClauses, filterHavingClauses } = buildFilterClauses(filters)
    conditions = filterClauses.length
      ? 'WHERE ' + filterClauses.join(' AND ')
      : ''
    having = filterHavingClauses.length
      ? 'HAVING ' + filterHavingClauses.join(' AND ')
      : ''

    if (advancedFilters.orderBy) {
      orderBy = `ORDER BY ${getTableColumnName(advancedFilters.orderBy.column)} ${advancedFilters.orderBy.direction}`
    }
  }

  return { select, conditions, having, orderBy }
}

function buildFilterClauses(filters: Record<string, any>) {
  const filterClauses: any = []
  const filterHavingClauses: any = []

  for (const [column, filter] of Object.entries(filters)) {
    const clause = getWhereClause(getTableColumnName(column), filter)
    ;(column === 'options' || column === 'products'
      ? filterHavingClauses
      : filterClauses
    ).push(clause)
  }

  return { filterClauses, filterHavingClauses }
}

export async function getModifierById(
  id: number
): Promise<SelectModifierResponseSchema> {
  try {
    const query = sql.raw(`
      SELECT
        ${tableName}.*,
        json_agg(DISTINCT jsonb_build_object(
          'name', ${tableOption}.name,
          'overcharge', ${tableOption}.overcharge,
          'idOption', ${tableOption}.id
        )) as options,
        json_agg(DISTINCT jsonb_build_object(
          'name', ${tableProduct}.name,
          'idProduct', ${tableProduct}.id
        )) FILTER (WHERE ${tableProduct}.name IS NOT NULL) as products
      FROM ${tableName}
      LEFT JOIN ${tableOption} ON ${tableName}.id = ${tableOption}.id_modifier
      LEFT JOIN ${tableModifierProduct} ON ${tableName}.id = ${tableModifierProduct}.id_modifier
      LEFT JOIN ${tableProduct} ON ${tableModifierProduct}.id_product = ${tableProduct}.id
      WHERE ${tableName}.id = ${id}
      GROUP BY ${tableName}.id
    `)

    const result = await db.execute(query).then((result) => result[0])

    if (!result) {
      console.log(`Modifier with id ${id} not found`)
      throw new NotFoundError('Modifier not found')
    }

    return mapModifierResult(result)
  } catch (error) {
    handleError(error, `fetch modifier with id ${id}`)
  }
}

function mapModifierResult(item: any): SelectModifierResponseSchema {
  return {
    id: item.id,
    name: item.name,
    isMultipleChoice: item.is_multiple_choice,
    isRequired: item.is_required,
    options: item.options || [],
    products: item.products || [],
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }
}

function getTableColumnName(column: string, select: boolean = false) {
  column = camelToSnakeCase(column)

  const columnTableMap: { [key: string]: string } = {
    name: tableName,
    options: tableOption,
    products: tableProduct,
    id_store: tableName
  }

  const table = columnTableMap[column] || tableName
  if (column === 'products' && select) {
    return `json_agg(DISTINCT jsonb_build_object(
      'name', ${tableProduct}.name,
      'idProduct', ${tableProduct}.id
    )) FILTER (WHERE ${tableProduct}.name IS NOT NULL) as products`
  } else if (column === 'products' && !select) {
    return `string_agg(DISTINCT ${tableProduct}.name, ',')`
  } else if (column === 'options' && select) {
    return `json_agg(DISTINCT jsonb_build_object(
      'name', ${tableOption}.name,
      'overcharge', ${tableOption}.overcharge,
      'idOption', ${tableOption}.id
    )) as options`
  } else if (column === 'options' && !select) {
    return `string_agg(DISTINCT ${tableOption}.name, ',')`
  }
  return `${table}.${column}`
}

export async function deleteModifiers(ids: number[]): Promise<number[]> {
  try {
    const deletedIds: number[] = []

    for (const id of ids) {
      const result = await db.transaction(async (trx) => {
        // Delete all related modifier_option records
        await trx
          .delete(modifierOptionTable)
          .where(eq(modifierOptionTable.idModifier, id))

        // Delete all related modifier_product records
        await trx
          .delete(modifierProductTable)
          .where(eq(modifierProductTable.idModifier, id))

        // Finally, delete the modifier itself
        const result = await trx
          .delete(modifierTable)
          .where(eq(modifierTable.id, id))
          .returning({ id: modifierTable.id })
          .then((result) => result[0])

        if (!result?.id) {
          trx.rollback()
          throw new NotFoundError('Modifier not found')
        }

        return result.id
      })

      if (result) {
        deletedIds.push(result)
      }
    }

    return deletedIds
  } catch (error) {
    handleError(error, 'delete modifiers')
  }
}

// Bulk update modifiers
export async function bulkUpdateModifiers(
  data: BulkUpdateModifierDTO
): Promise<number[]> {
  try {
    const updatedIds: number[] = []
    for (const id of data.ids) {
      const result = await db
        .update(modifierTable)
        .set(data.data)
        .where(eq(modifierTable.id, id))
        .returning({ id: modifierTable.id })
        .then((result) => result[0])

      if (!result) {
        console.log(`Modifier with id ${id} not found for update`)
        continue
      } else {
        updatedIds.push(result.id)
      }
    }
    return updatedIds
  } catch (error) {
    handleError(error, 'bulk update modifiers')
  }
}
