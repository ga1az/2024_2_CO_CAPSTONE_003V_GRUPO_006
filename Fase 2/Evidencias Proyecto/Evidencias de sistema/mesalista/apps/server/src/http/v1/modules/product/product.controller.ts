import { Elysia, t } from 'elysia'
import {
  createProductPrice,
  deleteProduct,
  deleteProductPrice,
  deleteProducts,
  getAllProducts,
  getAllProductsByCategoryId,
  getAllProductsWithPricesAndCategory,
  getCategoryByProductId,
  getModifiersByProductId,
  getProductById,
  getProductPriceByProductId,
  getProductsByModifier,
  updateProduct,
  updateProductPrice
} from './product.model'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import {
  SwaggerResponses,
  getBaseUrl,
  parseAdvancedFilters,
  createPaginationSchema,
  PaginationParams
} from '../../../../utils'
import {
  updateProductPriceSchema,
  insertProductPriceWithIdProductSchema,
  productWithPriceSchema,
  selectProductPriceSchema,
  selectProductSchema,
  categoryWithProductsSchema,
  selectProductPriceCategorySchema,
  updateProductWithPriceSchema,
  selectCategorySchema,
  selectModifierResponseSchema
} from '@mesalista/database/src/schema'
import { createNewProductWithPrice } from './product.service'
import { insertProductDTO } from './product.dto'

export const ProductController = new Elysia({ prefix: '/product' })
  .use(isAuthenticated)
  .model({
    createProduct: insertProductDTO,
    updateProduct: updateProductWithPriceSchema,
    createProductPrice: insertProductPriceWithIdProductSchema,
    updateProductPrice: updateProductPriceSchema
  })

  // Get product by id
  .get(
    '/:id',
    async function handler({ params, query }) {
      const result = await getProductById(params.id, query.withPrices)

      return {
        status: 200,
        message: 'Product found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(productWithPriceSchema)
      },
      params: t.Object({ id: t.Number() }),
      query: t.Object({
        withPrices: t.Optional(t.Boolean())
      })
    }
  )

  // Get all products by category id
  .get(
    '/category/:categoryId',
    async function handler({ params, query }) {
      const result = await getAllProductsByCategoryId(
        params.categoryId,
        query.ascBySort,
        query.withPrices
      )

      return {
        status: 200,
        message: 'Products found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(t.Array(productWithPriceSchema))
      },
      params: t.Object({ categoryId: t.Number() }),
      query: t.Object({
        ascBySort: t.Optional(t.Boolean()),
        withPrices: t.Optional(t.Boolean())
      })
    }
  )

  // Get all products with prices and category
  .get(
    '',
    async function handler({ query, payload }) {
      const result = await getAllProductsWithPricesAndCategory(
        query.ascBySort,
        payload.store
      )

      return {
        status: 200,
        message: 'Products found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(t.Array(categoryWithProductsSchema))
      },
      query: t.Object({
        ascBySort: t.Optional(t.Boolean())
      })
    }
  )

  // Create new product
  .post(
    '',
    async function handler({ body, payload }) {
      const { price, ...productWithoutPrice } = body
      const result = await createNewProductWithPrice(
        productWithoutPrice,
        price,
        payload.store
      )

      return {
        status: 201,
        message: 'Product created',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(productWithPriceSchema)
      },
      body: 'createProduct'
    }
  )

  // Update product
  .put(
    '/:id',
    async function handler({ params, body, payload }) {
      const result = await updateProduct(params.id, body, payload.store)

      return {
        status: 200,
        message: 'Product updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(selectProductSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateProduct'
    }
  )

  // Update product price
  .put(
    '/price/:id',
    async function handler({ params, body }) {
      const result = await updateProductPrice(params.id, body)

      return {
        status: 200,
        message: 'Product price updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(selectProductPriceSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateProductPrice'
    }
  )

  // Delete product price
  .delete(
    '/price/:id',
    async function handler({ params }) {
      const result = await deleteProductPrice(params.id)

      return {
        status: 200,
        message: 'Product price deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Delete product
  .delete(
    '/:id',
    async function handler({ params }) {
      const result = await deleteProduct(params.id)

      return {
        status: 200,
        message: 'Product deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get product price by id
  .get(
    '/price/product/:id',
    async function handler({ params }) {
      const result = await getProductPriceByProductId(params.id)

      return {
        status: 200,
        message: 'Product price found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(selectProductPriceSchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Create new product price
  .post(
    '/price',
    async function handler({ body }) {
      const result = await createProductPrice(body)

      return {
        status: 201,
        message: 'Product price created',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(selectProductPriceSchema)
      },
      body: 'createProductPrice'
    }
  )

  .get(
    '/all',
    async function handler({ query, payload, request }) {
      const paginationParams: PaginationParams = {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10
      }
      const baseUrl = getBaseUrl(request.url)

      const advancedFilters = parseAdvancedFilters(query)

      const result = await getAllProducts(
        payload.store,
        paginationParams,
        baseUrl,
        advancedFilters
      )

      return {
        status: 200,
        message: 'Products found',
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
        tags: ['Product'],
        responses: SwaggerResponses(
          createPaginationSchema(selectProductPriceCategorySchema)
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

  .delete(
    '/bulk',
    async function handler({ body }) {
      const result = await deleteProducts(body.ids)

      return {
        status: 200,
        message: 'Products deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      body: t.Object({
        ids: t.Array(t.Number())
      })
    }
  )

  // Get all products by modifier id
  .get(
    '/modifier/:modifierId',
    async function handler({ params }) {
      const result = await getProductsByModifier(params.modifierId)

      return {
        status: 200,
        message: 'Products found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(t.Array(productWithPriceSchema))
      },
      params: t.Object({ modifierId: t.Number() })
    }
  )

  .get(
    '/:id/category',
    async function handler({ params }) {
      const result = await getCategoryByProductId(params.id)

      return {
        status: 200,
        message: 'Category found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(selectCategorySchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Change from /:productId/modifiers to /:id/modifiers
  .get(
    '/:id/modifiers',
    async function handler({ params }) {
      const result = await getModifiersByProductId(params.id)

      return {
        status: 200,
        message: 'Modifiers found',
        data: result || []
      }
    },
    {
      detail: {
        tags: ['Product'],
        responses: SwaggerResponses(t.Array(selectModifierResponseSchema))
      },
      params: t.Object({ id: t.Number() })
    }
  )
