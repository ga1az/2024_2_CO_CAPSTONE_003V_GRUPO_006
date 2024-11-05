import { Elysia, t } from 'elysia'
import {
  createCategory,
  deleteCategory,
  getAllCategoriesByStoreId,
  getCategoryById,
  updateCategory,
  deleteCategories,
  bulkUpdateCategories,
  updateCategoryOrder
} from './category.model'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import {
  SwaggerResponses,
  getBaseUrl,
  parseAdvancedFilters,
  createPaginationSchema,
  PaginationParams
} from '../../../../utils'
import {
  bulkUpdateCategoryDTO,
  insertCategoryDTO,
  updateCategoryDTO,
  updateReorderCategory
} from './category.dto'
import { selectCategorySchema } from '@mesalista/database/src/schema'

export const CategoryController = new Elysia({ prefix: '/category' })
  .use(isAuthenticated)
  .model({
    createCategory: insertCategoryDTO,
    updateCategory: updateCategoryDTO,
    bulkUpdateCategory: bulkUpdateCategoryDTO,
    updateReorderCategory: updateReorderCategory
  })

  // Get category by id
  .get(
    '/:id',
    async function handler({ params }) {
      const result = await getCategoryById(params.id)

      return {
        status: 200,
        message: 'Category found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(selectCategorySchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get all categories by store id
  .get(
    '/store/:storeId',
    async function handler({ params, query, request }) {
      const paginationParams: PaginationParams = {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10
      }
      const baseUrl = getBaseUrl(request.url)

      const advancedFilters = parseAdvancedFilters(query)

      const result = await getAllCategoriesByStoreId(
        params.storeId,
        paginationParams,
        baseUrl,
        advancedFilters
      )

      return {
        status: 200,
        message: 'Categories found',
        data: result.data,
        pagination: {
          next: result.next,
          prev: result.prev,
          totalItems: result.totalItems,
          currentItems: result.currentItems
        }
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(
          t.Object({
            data: t.Array(selectCategorySchema),
            pagination: t.Object({
              next: t.Optional(t.String()),
              prev: t.Optional(t.String()),
              totalItems: t.Number(),
              currentItems: t.Number()
            })
          })
        )
      },
      params: t.Object({ storeId: t.Number() }),
      query: t.Object({
        page: t.Optional(t.Number()),
        pageSize: t.Optional(t.Number()),
        select: t.Optional(t.String()),
        orderBy: t.Optional(t.String()),
        filters: t.Optional(t.String())
      })
    }
  )

  // Get all categories by store id
  .get(
    '/all',
    async function handler({ query, payload, request }) {
      const paginationParams: PaginationParams = {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10
      }
      const baseUrl = getBaseUrl(request.url)

      const advancedFilters = parseAdvancedFilters(query)

      const result = await getAllCategoriesByStoreId(
        payload.store,
        paginationParams,
        baseUrl,
        advancedFilters
      )

      return {
        status: 200,
        message: 'Categories found',
        data: result.data,
        pagination: {
          next: result.next,
          prev: result.prev,
          totalItems: result.totalItems,
          currentItems: result.currentItems
        }
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(
          createPaginationSchema(selectCategorySchema)
        )
      },
      query: t.Object({
        page: t.Optional(t.Number()),
        pageSize: t.Optional(t.Number()),
        select: t.Optional(t.String()),
        orderBy: t.Optional(t.String()),
        filters: t.Optional(t.String())
      })
    }
  )

  // Create new category
  .post(
    '',
    async function handler({ body, payload }) {
      const newBody = {
        ...body,
        idStore: payload.store
      }

      const result = await createCategory(newBody)

      return {
        status: 201,
        message: 'Category created',
        data: result
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(selectCategorySchema)
      },
      body: 'createCategory'
    }
  )

  // Update category
  .put(
    '/:id',
    async function handler({ params, body, payload }) {
      const result = await updateCategory(params.id, body, payload.store)

      return {
        status: 200,
        message: 'Category updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(selectCategorySchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateCategory'
    }
  )

  // Delete category
  .delete(
    '/:id',
    async function handler({ params }) {
      const result = await deleteCategory(params.id)

      return {
        status: 200,
        message: 'Category deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Delete cotegories
  .delete(
    '/bulk',
    async function handler({ body }) {
      const result = await deleteCategories(body.ids)

      return {
        status: 200,
        message: 'Categories deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      body: t.Object({
        ids: t.Array(t.Number())
      })
    }
  )

  // Bulk update categories
  .put(
    '/bulk',
    async function handler({ body, payload }) {
      const result = await bulkUpdateCategories(body, payload.store)

      return {
        status: 200,
        message: 'Categories updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      body: bulkUpdateCategoryDTO
    }
  )

  // Update category order
  .put(
    '/reorder',
    async function handler({ body }) {
      const result = await updateCategoryOrder(body)

      return {
        status: 200,
        message: 'Categories updated',
        data: {
          order: result
        }
      }
    },
    {
      detail: {
        tags: ['Category'],
        responses: SwaggerResponses(updateReorderCategory)
      },
      body: updateReorderCategory
    }
  )
