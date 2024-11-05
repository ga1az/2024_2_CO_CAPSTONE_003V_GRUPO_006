import { asc, db, desc, eq, sql } from '@mesalista/database'
import {
  CategoryWithProductsSchema,
  InsertProductPriceSchema,
  InsertProductPriceWithIdProductSchema,
  InsertProductSchema,
  ProductWithPriceSchema,
  SelectModifierOptionSchema,
  SelectProductPriceCategory,
  SelectProductPriceSchema,
  SelectProductSchema,
  UpdateProductWithPriceSchema,
  categoryTable,
  modifierOptionTable,
  modifierProductTable,
  modifierTable,
  productPriceTable,
  productTable
} from '@mesalista/database/src/schema'
import {
  DatabaseError,
  NotFoundError
} from '../../../../middlewares/error.middleware'
import {
  AdvancedFilters,
  PaginationParams,
  PaginationResult,
  buildPaginationUrls,
  camelToSnakeCase,
  generateRandomString,
  getWhereClause,
  handleError,
  uploadBase64
} from '../../../../utils'

const tableName = 'product'
const tableCategoryName = 'category'
const tablePriceName = 'product_price'

// Get product by id
export async function getProductById(
  productId: number,
  withPrices: boolean = false
): Promise<ProductWithPriceSchema> {
  try {
    const query = () => {
      const query = db
        .select()
        .from(productTable)
        .where(eq(productTable.id, productId))

      if (withPrices) {
        query.leftJoin(
          productPriceTable,
          eq(productPriceTable.idProduct, productId)
        )
      }
      return query.then((result) => result[0])
    }
    const result = await query()

    if (!result) {
      console.log(`Product with id ${productId} not found`)
      throw new NotFoundError('Product not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch product by id')
  }
}

// Get all products by category id
export async function getAllProductsByCategoryId(
  categoryId: number,
  ascBySort: boolean = true,
  withPrices: boolean = false
): Promise<ProductWithPriceSchema[]> {
  try {
    const orderBy = () => {
      return ascBySort ? asc(productTable.sort) : desc(productTable.sort)
    }
    const query = () => {
      const query = db
        .select()
        .from(productTable)
        .where(eq(productTable.idCategory, categoryId))

      if (withPrices) {
        query.leftJoin(
          productPriceTable,
          eq(productPriceTable.idProduct, productTable.id)
        )
      }

      return query.orderBy(orderBy)
    }
    const result = await query()

    if (!result || result.length === 0) {
      console.log(`No products found for category id ${categoryId}`)
      throw new NotFoundError('No products found for this category')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch products by category id')
  }
}

// Get all products with prices and category
export async function getAllProductsWithPricesAndCategory(
  ascBySort: boolean = true,
  storeId: number
): Promise<CategoryWithProductsSchema[]> {
  try {
    const orderBy = () => {
      return ascBySort ? asc(productTable.sort) : desc(productTable.sort)
    }
    const result = await db
      .select()
      .from(productTable)
      .leftJoin(
        productPriceTable,
        eq(productPriceTable.idProduct, productTable.id)
      )
      .leftJoin(categoryTable, eq(categoryTable.id, productTable.idCategory))
      .orderBy(orderBy)
      .where(eq(categoryTable.idStore, storeId))
      .then((result) => result)

    if (!result || result.length === 0) {
      console.log('No products found')
      throw new NotFoundError('No products found')
    }

    const groupedByCategory: Record<number, CategoryWithProductsSchema> = {}

    result.forEach((row) => {
      if (row.category) {
        const categoryId = row.category.id

        if (!groupedByCategory[categoryId]) {
          groupedByCategory[categoryId] = {
            ...row.category,
            products: []
          }
        }

        const product: ProductWithPriceSchema = {
          ...row.product,
          price: row.product_price
            ? {
                ...row.product_price,
                idProduct: row.product.id
              }
            : undefined
        }

        groupedByCategory[categoryId].products.push(product)
      }
    })

    return Object.values(groupedByCategory)
  } catch (error) {
    handleError(error, 'fetch products with prices and category')
  }
}

// Create new product
export async function createProduct(
  data: InsertProductSchema,
  storeId: number
): Promise<SelectProductSchema> {
  try {
    if (data.bgImage) {
      data.bgImage = await uploadBase64(
        data.bgImage,
        `product-${storeId}-${generateRandomString(5)}`
      )
    }
    const result = await db
      .insert(productTable)
      .values(data)
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Failed to create product with data: ${JSON.stringify(data)}`)
      throw new DatabaseError('Failed to create product')
    }

    return result
  } catch (error) {
    handleError(error, 'create product')
  }
}

// update product
export async function updateProduct(
  id: number,
  data: UpdateProductWithPriceSchema,
  storeId: number
): Promise<SelectProductSchema> {
  try {
    console.log(data)
    if (data.bgImage) {
      data.bgImage = await uploadBase64(
        data.bgImage,
        `product-${storeId}-${generateRandomString(5)}`
      )
    }

    const result = await db.transaction(async (trx) => {
      const result = await trx
        .update(productTable)
        .set(data)
        .where(eq(productTable.id, id))
        .returning()
        .then((result) => result[0])

      if (!result.id) {
        console.log(`Product with id ${id} not found for update`)
        trx.rollback()
        throw new NotFoundError('Product not found')
      }

      if (data.price) {
        const priceResult = await trx
          .update(productPriceTable)
          .set({ price: data.price })
          .where(eq(productPriceTable.idProduct, id))
          .returning()
          .then((result) => result[0])

        if (!priceResult.id) {
          console.log(`Product price with id ${id} not found for update`)
          trx.rollback()
          throw new NotFoundError('Product price not found')
        }
      }

      return result
    })

    return result
  } catch (error) {
    handleError(error, 'update product')
  }
}

// Create new product price
export async function createProductPrice(
  data: InsertProductPriceWithIdProductSchema
): Promise<SelectProductPriceSchema> {
  try {
    const result = await db
      .insert(productPriceTable)
      .values(data)
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(
        `Failed to create product price with data: ${JSON.stringify(data)}`
      )
      throw new DatabaseError('Failed to create product price')
    }

    return result
  } catch (error) {
    handleError(error, 'create product price')
  }
}

// Update product price
export async function updateProductPrice(
  id: number,
  data: Partial<InsertProductPriceSchema>
): Promise<SelectProductPriceSchema> {
  try {
    const result = await db
      .update(productPriceTable)
      .set(data)
      .where(eq(productPriceTable.id, id))
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Product price with id ${id} not found for update`)
      throw new NotFoundError('Product price not found')
    }

    return result
  } catch (error) {
    handleError(error, 'update product price')
  }
}

// Get product price by product id
export async function getProductPriceByProductId(
  productId: number
): Promise<SelectProductPriceSchema> {
  try {
    const result = await db.query.productPriceTable.findFirst({
      where: eq(productPriceTable.idProduct, productId)
    })

    if (!result) {
      console.log(`Product price not found for product id ${productId}`)
      throw new NotFoundError('Product price not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch product price by product id')
  }
}

// Delete product price
export async function deleteProductPrice(id: number): Promise<number> {
  try {
    const result = await db
      .delete(productPriceTable)
      .where(eq(productPriceTable.id, id))
      .returning({ id: productPriceTable.id })
      .then((result) => result[0])

    if (!result) {
      console.log(`Product price with id ${id} not found for deletion`)
      throw new NotFoundError('Product price not found')
    }

    return result.id
  } catch (error) {
    handleError(error, 'delete product price')
  }
}

// Delete product
export async function deleteProduct(id: number): Promise<number> {
  try {
    const result = await db
      .delete(productTable)
      .where(eq(productTable.id, id))
      .returning({ id: productTable.id })
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Product with id ${id} not found for deletion`)
      throw new NotFoundError('Product not found')
    }

    return result.id
  } catch (error) {
    handleError(error, 'delete product')
  }
}

// Get all products
export async function getAllProducts(
  storeId: number,
  params: PaginationParams,
  baseUrl: string,
  advancedFilters?: AdvancedFilters
): Promise<PaginationResult<SelectProductPriceCategory>> {
  try {
    const filters = advancedFilters?.filters || {}
    filters['idStore'] = { operator: 'eq', value: storeId }

    let select = `${tableName}.*, ${tablePriceName}.price as price, ${tableCategoryName}.name as category`
    let conditions = ''
    let orderBy = ''

    if (advancedFilters) {
      // If advancedFilters.select is defined, use it to select the columns
      if (advancedFilters.select && advancedFilters.select.length > 0) {
        select = advancedFilters.select
          .map((column) => getTableColumnName(camelToSnakeCase(column), true))
          .join(',')
      }
      // If advancedFilters.filters is defined, use it to build the WHERE clause
      if (filters) {
        const filterClauses = []
        for (const [column, filter] of Object.entries(filters)) {
          filterClauses.push(
            getWhereClause(getTableColumnName(camelToSnakeCase(column)), filter)
          )
        }
        if (filterClauses.length > 0) {
          conditions = 'WHERE ' + filterClauses.join(' AND ')
        }
      }
      // If advancedFilters.orderBy is defined, use it to build the ORDER BY clause
      if (advancedFilters.orderBy) {
        orderBy = `ORDER BY ${getTableColumnName(camelToSnakeCase(advancedFilters.orderBy.column))} ${advancedFilters.orderBy.direction}`
      }
    }

    const countQuery = sql.raw(`
      SELECT COUNT(*) as count
      FROM ${tableName}
      JOIN ${tableCategoryName} ON ${tableName}.id_category = ${tableCategoryName}.id
      JOIN ${tablePriceName} ON ${tableName}.id = ${tablePriceName}.id_product
      ${conditions}
    `)

    const mainQuery = sql.raw(`
      SELECT ${select}
      FROM ${tableName}
      JOIN ${tableCategoryName} ON ${tableName}.id_category = ${tableCategoryName}.id
      JOIN ${tablePriceName} ON ${tableName}.id = ${tablePriceName}.id_product
      ${conditions}
      ${orderBy}
      LIMIT ${params.pageSize}
      OFFSET ${params.pageSize * (params.page - 1)}
    `)

    const [totalItemsResult, result] = await Promise.all([
      db.execute(countQuery),
      db.execute(mainQuery)
    ])

    if (!totalItemsResult || !totalItemsResult[0]) {
      console.log(`No products found`)
      throw new NotFoundError('No products found')
    }

    const totalItems = Number(totalItemsResult[0].count)

    if (!result || result.length === 0) {
      console.log(`No products found`)
      throw new NotFoundError('No products found')
    }

    const { next, prev } = buildPaginationUrls(
      baseUrl,
      params,
      totalItems,
      result.length,
      advancedFilters
    )

    const dataResult: SelectProductPriceCategory[] = result.map(
      (item: any) => ({
        id: item.id,
        idCategory: item.id_category,
        name: item.name,
        description: item.description,
        isActive: item.is_active,
        bgImage: item.bg_image,
        isGlutenFree: item.is_gluten_free,
        isVegan: item.is_vegan,
        isNew: item.is_new,
        isPopular: item.is_popular,
        isSpicy: item.is_spicy,
        kcal: item.kcal,
        sort: item.sort,
        isSoloItem: item.is_solo_item,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        price: item.price,
        category: item.category
      })
    )

    return {
      data: dataResult,
      next,
      prev,
      totalItems,
      currentItems: result.length
    }
  } catch (error) {
    handleError(error, 'fetch all products')
  }
}

function getTableColumnName(column: string, select: boolean = false) {
  const columnTableMap: { [key: string]: string } = {
    name: tableName,
    price: tablePriceName,
    category: tableCategoryName,
    id_store: tableCategoryName
  }

  const table = columnTableMap[column] || tableName
  if (column === 'category' && select) {
    return `${table}.name as category`
  } else if (column === 'category' && !select) {
    return `${table}.name`
  }
  return `${table}.${column}`
}

// Delete products
export async function deleteProducts(ids: number[]): Promise<number[]> {
  try {
    const result = await db.transaction(async (trx) => {
      const deletedIds: number[] = []
      for (const id of ids) {
        await trx
          .delete(productPriceTable)
          .where(eq(productPriceTable.idProduct, id))
          .returning({ id: productPriceTable.id })
          .then((result) => result[0] || null)

        const deleteProduct = await trx
          .delete(productTable)
          .where(eq(productTable.id, id))
          .returning({ id: productTable.id })
          .then((result) => result[0] || null)

        if (!deleteProduct) {
          console.log(`Product with id ${id} not found for deletion`)
          trx.rollback()
          throw new NotFoundError('Product not found')
        }
        deletedIds.push(deleteProduct.id)
      }
      return ids
    })

    return result
  } catch (error) {
    handleError(error, 'delete products')
  }
}

export async function getProductsByModifier(
  modifierId: number
): Promise<ProductWithPriceSchema[]> {
  try {
    const result = await db
      .select({
        id: productTable.id,
        name: productTable.name,
        description: productTable.description,
        isActive: productTable.isActive,
        bgImage: productTable.bgImage,
        isGlutenFree: productTable.isGlutenFree,
        isVegan: productTable.isVegan,
        isNew: productTable.isNew,
        isPopular: productTable.isPopular,
        isSpicy: productTable.isSpicy,
        kcal: productTable.kcal,
        sort: productTable.sort,
        isSoloItem: productTable.isSoloItem,
        idCategory: productTable.idCategory, // Add this field
        createdAt: productTable.createdAt,
        updatedAt: productTable.updatedAt,
        price: productPriceTable.price
      })
      .from(productTable)
      .innerJoin(
        modifierProductTable,
        eq(modifierProductTable.idProduct, productTable.id)
      )
      .leftJoin(
        productPriceTable,
        eq(productPriceTable.idProduct, productTable.id)
      )
      .where(eq(modifierProductTable.idModifier, modifierId))
      .orderBy(productTable.sort)

    if (!result || result.length === 0) {
      console.log(`No products found for modifier id ${modifierId}`)
      throw new NotFoundError('No products found for this modifier')
    }

    // Transform the result to match ProductWithPriceSchema
    const transformedResult: ProductWithPriceSchema[] = result.map(
      (product) => ({
        ...product,
        price: product.price
          ? {
              id: 0, // Since we're only selecting the price value
              price: product.price,
              idProduct: product.id,
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true, // Default value
              startDate: new Date(), // Default value
              endDate: null, // Default value
              isDiscount: false, // Default value
              discount: null // Default value
            }
          : undefined
      })
    )

    return transformedResult
  } catch (error) {
    handleError(error, 'fetch products by modifier id')
  }
}

// Get category by product id
export async function getCategoryByProductId(productId: number) {
  try {
    const product = await db.query.productTable.findFirst({
      where: eq(productTable.id, productId),
      columns: {
        idCategory: true
      }
    })

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    const category = await db.query.categoryTable.findFirst({
      where: eq(categoryTable.id, product.idCategory)
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    return category
  } catch (error) {
    handleError(error, 'fetch category by product id')
  }
}

// Get modifiers by product id
export async function getModifiersByProductId(productId: number) {
  try {
    const result = await db
      .select({
        modifier: {
          id: modifierTable.id,
          name: modifierTable.name,
          isMultipleChoice: modifierTable.isMultipleChoice,
          isRequired: modifierTable.isRequired,
          createdAt: modifierTable.createdAt,
          updatedAt: modifierTable.updatedAt
        },
        options: sql<SelectModifierOptionSchema[]>`
          json_agg(
            json_build_object(
              'id', ${modifierOptionTable.id},
              'name', ${modifierOptionTable.name},
              'overcharge', ${modifierOptionTable.overcharge}
            )
          ) filter (where ${modifierOptionTable.id} is not null)
        `
      })
      .from(modifierProductTable)
      .innerJoin(
        modifierTable,
        eq(modifierProductTable.idModifier, modifierTable.id)
      )
      .leftJoin(
        modifierOptionTable,
        eq(modifierOptionTable.idModifier, modifierTable.id)
      )
      .where(eq(modifierProductTable.idProduct, productId))
      .groupBy(modifierTable.id)

    if (!result.length) {
      return [] // Return empty array instead of throwing error
    }

    // Transform the result to match the expected format
    return result.map((item) => ({
      ...item.modifier,
      options: item.options || []
    }))
  } catch (error) {
    handleError(error, 'fetch modifiers by product id')
  }
}
