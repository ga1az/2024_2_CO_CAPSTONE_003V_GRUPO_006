import { db, eq, sql } from '@mesalista/database'
import {
  InsertCategorySchema,
  SelectCategorySchema,
  categoryTable
} from '@mesalista/database/src/schema'
import {
  DatabaseError,
  NotFoundError
} from '../../../../middlewares/error.middleware'
import {
  buildPaginationUrls,
  camelToSnakeCase,
  generateRandomString,
  getWhereClause,
  handleError,
  AdvancedFilters,
  PaginationParams,
  PaginationResult,
  uploadBase64
} from '../../../../utils'
import {
  BulkUpdateCategoryDTO,
  UpdateReorderCategory,
  UpdateReorderItem
} from './category.dto'

// Get category by id
export async function getCategoryById(
  categoryId: number
): Promise<SelectCategorySchema> {
  try {
    const result = await db.query.categoryTable.findFirst({
      where: eq(categoryTable.id, categoryId)
    })

    if (!result) {
      console.log(`Category with id ${categoryId} not found`)
      throw new NotFoundError('Category not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch category by id')
  }
}

// Get all categories by store id
export async function getAllCategoriesByStoreId(
  storeId: number,
  params: PaginationParams,
  baseUrl: string,
  advancedFilters?: AdvancedFilters
): Promise<PaginationResult<SelectCategorySchema>> {
  try {
    const tableName = 'category'

    const filters = advancedFilters?.filters || {}
    filters['idStore'] = { operator: 'eq', value: storeId }

    let select = '*'
    let conditions = ''
    let orderBy = ''
    // Obtain the columns of the table
    type categoryColumns = keyof typeof categoryTable.$inferSelect
    // If advancedFilters.select is defined, use it to select the columns or throw an error
    advancedFilters?.select as categoryColumns[]

    // If advancedFilters is defined, use it to build the query
    if (advancedFilters) {
      // If advancedFilters.select is defined, use it to select the columns
      if (advancedFilters.select && advancedFilters.select.length > 0) {
        select = advancedFilters.select
          .map((column) => camelToSnakeCase(column))
          .join(',')
      }
      // If advancedFilters.filters is defined, use it to build the WHERE clause
      if (filters) {
        const filterClauses = []
        for (const [column, filter] of Object.entries(filters)) {
          filterClauses.push(getWhereClause(camelToSnakeCase(column), filter))
        }
        if (filterClauses.length > 0) {
          conditions = 'WHERE ' + filterClauses.join(' AND ')
        }
      }
      // If advancedFilters.orderBy is defined, use it to build the ORDER BY clause
      if (advancedFilters.orderBy) {
        orderBy = `ORDER BY ${camelToSnakeCase(advancedFilters.orderBy.column)} ${advancedFilters.orderBy.direction}`
      }
    }

    const offset = (params.page - 1) * params.pageSize

    const countQuery = sql.raw(`
      SELECT COUNT(*) as count
      FROM ${tableName}
      ${conditions}
    `)

    const mainQuery = sql.raw(`
      SELECT ${select}
      FROM ${tableName}
      ${conditions}
      ${orderBy}
      LIMIT ${params.pageSize}
      OFFSET ${offset}
      `)

    const [totalItemsResult, result] = await Promise.all([
      db.execute(countQuery),
      db.execute(mainQuery)
    ])

    if (!totalItemsResult || !totalItemsResult[0]) {
      console.log(`No categories found`)
      throw new NotFoundError('No categories found')
    }

    const totalItems = Number(totalItemsResult[0].count)

    if (!result || result.length === 0) {
      throw new NotFoundError('No items found')
    }

    const { next, prev } = buildPaginationUrls(
      baseUrl,
      params,
      totalItems,
      result.length,
      advancedFilters
    )

    const dataResult: SelectCategorySchema[] = result.map((item: any) => ({
      id: item.id,
      idStore: item.id_store,
      name: item.name,
      description: item.description,
      isActive: item.is_active,
      sort: item.sort,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      bgImage: item.bg_image
    }))

    return {
      data: dataResult,
      next,
      prev,
      totalItems,
      currentItems: result.length
    }
  } catch (error) {
    handleError(error, 'fetch categories')
  }
}

// Create new category
export async function createCategory(
  data: InsertCategorySchema
): Promise<SelectCategorySchema> {
  try {
    if (data.bgImage) {
      data.bgImage = await uploadBase64(
        data.bgImage,
        `category-${data.idStore}-${generateRandomString(5)}`
      )
    }

    const result = await db
      .insert(categoryTable)
      .values(data)
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(
        `Failed to create category with data: ${JSON.stringify(data)}`
      )
      throw new DatabaseError('Failed to create category')
    }

    return result
  } catch (error) {
    handleError(error, 'create category')
  }
}

// Update category
export async function updateCategory(
  id: number,
  data: Partial<InsertCategorySchema>,
  storeId: number
): Promise<SelectCategorySchema> {
  try {
    if (data.bgImage) {
      data.bgImage = await uploadBase64(
        data.bgImage,
        `category-${storeId}-${generateRandomString(5)}`
      )
    }

    const result = await db
      .update(categoryTable)
      .set(data)
      .where(eq(categoryTable.id, id))
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Category with id ${id} not found for update`)
      throw new NotFoundError('Category not found')
    }

    return result
  } catch (error) {
    handleError(error, 'update category')
  }
}

// Delete category
export async function deleteCategory(id: number): Promise<number> {
  try {
    const result = await db
      .delete(categoryTable)
      .where(eq(categoryTable.id, id))
      .returning({ id: categoryTable.id })
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Category with id ${id} not found for deletion`)
      throw new NotFoundError('Category not found')
    }

    return result.id
  } catch (error) {
    handleError(error, 'delete category')
  }
}

export async function deleteCategories(ids: number[]): Promise<number[]> {
  try {
    const deletedIds: number[] = []
    for (const id of ids) {
      const result = await db
        .delete(categoryTable)
        .where(eq(categoryTable.id, id))
        .returning({ id: categoryTable.id })
        .then((result) => result[0])

      if (!result) {
        console.log(`Category with id ${id} not found for deletion`)
        continue
      } else {
        deletedIds.push(result.id)
      }
    }

    return deletedIds
  } catch (error) {
    handleError(error, 'delete categories')
  }
}

export async function bulkUpdateCategories(
  data: BulkUpdateCategoryDTO,
  storeId: number
): Promise<number[]> {
  try {
    const ids: number[] = []
    for (const id of data.ids) {
      if (data.data.bgImage) {
        data.data.bgImage = await uploadBase64(
          data.data.bgImage,
          `category-${storeId}`
        )
      }

      const result = await db
        .update(categoryTable)
        .set(data.data)
        .where(eq(categoryTable.id, id))
        .returning({ id: categoryTable.id, isActive: categoryTable.isActive })
        .then((result) => result[0])

      if (!result) {
        console.log(`Category with id ${id} not found for update`)
        continue
      } else {
        ids.push(result.id)
      }
    }

    return ids
  } catch (error) {
    handleError(error, 'bulk update categories')
  }
}

// Update category order
export async function updateCategoryOrder(
  data: UpdateReorderCategory
): Promise<UpdateReorderItem[]> {
  try {
    const dataResult: UpdateReorderItem[] = []
    for (const item of data.order) {
      const result = await db
        .update(categoryTable)
        .set({ sort: item.sort })
        .where(eq(categoryTable.id, item.id))
        .returning({ id: categoryTable.id, sort: categoryTable.sort })
        .then((result) => result[0])

      if (!result) {
        console.log(`Category with id ${item.id} not found for update`)
        continue
      } else {
        dataResult.push(result)
      }
    }

    return dataResult
  } catch (error) {
    handleError(error, 'update category order')
  }
}
