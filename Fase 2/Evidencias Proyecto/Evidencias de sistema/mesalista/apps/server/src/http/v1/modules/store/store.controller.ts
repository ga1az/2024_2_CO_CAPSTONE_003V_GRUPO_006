import { Elysia, t } from 'elysia'
import {
  createStore,
  deleteStore,
  getAllStores,
  getStoreById,
  getStoreBySlug,
  updateStore
} from './store.model'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import { SwaggerResponses } from '../../../../utils'
import {
  insertStoreSchema,
  selectStoreSchema,
  updateStoreSchema
} from '@mesalista/database/src/schema'

export const StoreController = new Elysia({ prefix: '/store' })
  .use(isAuthenticated)
  .model({
    createStore: insertStoreSchema,
    updateStore: updateStoreSchema
  })

  // Get store by id
  .get(
    '/id/:id',
    async function handler({ params }) {
      const result = await getStoreById(params.id)

      return {
        status: 200,
        message: 'Store found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Store'],
        responses: SwaggerResponses(selectStoreSchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get store by slug
  .get(
    '/slug/:slug',
    async function handler({ params }) {
      const result = await getStoreBySlug(params.slug)

      return {
        status: 200,
        message: 'Store found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Store'],
        responses: SwaggerResponses(selectStoreSchema)
      },
      params: t.Object({ slug: t.String() })
    }
  )

  // Create new store
  .post(
    '',
    async function handler({ body }) {
      const result = await createStore(body)

      return {
        status: 201,
        message: 'Store created',
        data: result
      }
    },
    {
      detail: {
        tags: ['Store'],
        responses: SwaggerResponses(selectStoreSchema)
      },
      body: 'createStore'
    }
  )

  // Update store
  .put(
    '/id/:id',
    async function handler({ params, body }) {
      const result = await updateStore(params.id, body)

      return {
        status: 200,
        message: 'Store updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Store'],
        responses: SwaggerResponses(selectStoreSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateStore'
    }
  )

  // Get all stores
  .get(
    '',
    async function handler({ payload }) {
      const result = await getStoreById(payload.store)

      return {
        status: 200,
        message: 'Stores found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Store'],
        responses: SwaggerResponses(t.Array(selectStoreSchema))
      }
    }
  )

  // Delete store
  .delete(
    '/:id',
    async function handler({ params }) {
      const result = await deleteStore(params.id)

      return {
        status: 200,
        message: 'Store deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Store'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  .get(
    '/all',
    async function handler() {
      const result = await getAllStores()

      return {
        status: 200,
        message: 'Stores found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Store'],
        responses: SwaggerResponses(t.Array(selectStoreSchema))
      }
    }
  )

  .put(
    '',
    async function handler({ payload, body }) {
      const result = await updateStore(payload.store, body)

      return {
        status: 200,
        message: 'Store updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Store'],
        responses: SwaggerResponses(selectStoreSchema)
      },
      body: 'updateStore'
    }
  )
