import { Elysia, t } from 'elysia'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import {
  SwaggerResponses,
  createPaginationSchema,
  PaginationParams,
  getBaseUrl,
  parseAdvancedFilters
} from '../../../../utils'
import {
  insertModifierOptionWithoutIdOptSchema,
  insertModifierDTO,
  updateModifierDTO,
  updateModifierOptionDto,
  bulkUpdateModifierDTO
} from './modifier.dto'
import {
  bulkUpdateModifiers,
  deleteModifier,
  deleteModifierOption,
  deleteModifierProduct,
  deleteModifiers,
  getModifierById,
  getModifiers,
  updateModifier,
  updateModifierOption
} from './modifier.model'
import {
  insertModifierOptionSchema,
  insertModifierProductSchema,
  selectModifierOptionSchema,
  selectModifierResponseSchema,
  selectModifierSchema,
  updateModifierOptionSchema
} from '@mesalista/database/src/schema'
import {
  createModifierWithOptions,
  updateModifierWithOptionsAndProducts
} from './modifier.service'

export const ModifierController = new Elysia({ prefix: '/modifier' })
  .use(isAuthenticated)
  .model({
    createModifierWithOptions: insertModifierOptionWithoutIdOptSchema,
    createModifierProduct: insertModifierProductSchema,
    updateModifier: updateModifierDTO,
    updateModifierOption: updateModifierOptionSchema,
    createModifier: insertModifierDTO,
    createModifierOption: insertModifierOptionSchema,
    updateModifierWithOptionsAndProducts: updateModifierOptionDto,
    bulkUpdateModifier: bulkUpdateModifierDTO
  })

  // Create new modifier
  .post(
    '',
    async function handler({ body, payload }) {
      const newBody = {
        ...body,
        idStore: payload.store
      }
      const result = await createModifierWithOptions(newBody)

      return {
        status: 201,
        message: 'Modifier created',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(selectModifierSchema)
      },
      body: 'createModifierWithOptions'
    }
  )

  // Update modifier
  .put(
    '/:id',
    async function handler({ params, body }) {
      const result = await updateModifier(params.id, body)

      return {
        status: 200,
        message: 'Modifier updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(selectModifierSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateModifier'
    }
  )

  // Update modifierOption
  .put(
    '/option/:id',
    async function handler({ params, body }) {
      const result = await updateModifierOption(params.id, body)

      return {
        status: 200,
        message: 'ModifierOption updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(selectModifierOptionSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateModifierOption'
    }
  )

  // Delete modifierOption
  .delete(
    '/option/:id',
    async function handler({ params }) {
      const result = await deleteModifierOption(params.id)

      return {
        status: 200,
        message: 'ModifierOption deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Delete modifier
  .delete(
    '/:id',
    async function handler({ params }) {
      const result = await deleteModifier(params.id)

      return {
        status: 200,
        message: 'Modifier deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Delete modifierProduct
  .delete(
    '/product/:id',
    async function handler({ params }) {
      const result = await deleteModifierProduct(params.id)

      return {
        status: 200,
        message: 'ModifierProduct deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  .get(
    '/all',
    async function handler({ query, request, payload }) {
      const paginationParams: PaginationParams = {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10
      }
      const baseUrl = getBaseUrl(request.url)

      const advancedFilters = parseAdvancedFilters(query)

      const result = await getModifiers(
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
        tags: ['Modifier'],
        responses: SwaggerResponses(
          createPaginationSchema(selectModifierResponseSchema)
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

  // Get modifier by ID
  .get(
    '/:id',
    async function handler({ params }) {
      const result = await getModifierById(params.id)

      return {
        status: 200,
        message: 'Modifier found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(selectModifierResponseSchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Update modifier with options and products
  .put(
    '/modifier/:id',
    async function handler({ params, body }) {
      console.log('Updating modifier:', params.id, body)
      const result = await updateModifierWithOptionsAndProducts(params.id, body)
      return { status: 200, message: 'Modifier updated', data: result }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(selectModifierSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateModifierWithOptionsAndProducts'
    }
  )

  // Bulk delete modifiers
  .delete(
    '/bulk',
    async function handler({ body }) {
      const result = await deleteModifiers(body.ids)

      return {
        status: 200,
        message: 'Modifiers deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(t.Object({ ids: t.Array(t.Number()) }))
      },
      body: t.Object({
        ids: t.Array(t.Number())
      })
    }
  )

  // Bulk update modifiers
  .put(
    '/bulk',
    async function handler({ body }) {
      const result = await bulkUpdateModifiers(body)

      return {
        status: 200,
        message: 'Modifiers updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Modifier'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      body: bulkUpdateModifierDTO
    }
  )
