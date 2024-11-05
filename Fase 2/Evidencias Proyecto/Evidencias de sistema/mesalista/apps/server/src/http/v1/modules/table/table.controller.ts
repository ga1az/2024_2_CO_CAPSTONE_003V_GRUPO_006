import { Elysia, t } from 'elysia'
import {
  createTable,
  deleteTable,
  deleteTableSession,
  getAllTablesByStoreId,
  getAllTableSessionsByTableId,
  getTableById,
  getTableByIdentifier,
  getTableSessionById,
  getTableSessionBySessionToken,
  updateTable
} from './table.model'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import { SwaggerResponses } from '../../../../utils'
import {
  selectTableSchema,
  selectTableSessionSchema
} from '@mesalista/database/src/schema'

import { insertTableDTO, updateTableDTO } from './table.dto'

export const TableController = new Elysia({ prefix: '/table' })
  .use(isAuthenticated)
  .model({
    createTable: insertTableDTO,
    updateTable: updateTableDTO
  })

  // Get table by id
  .get(
    '/:id',
    async function handler({ params }) {
      const result = await getTableById(params.id)

      return {
        status: 200,
        message: 'Table found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(selectTableSchema),
        description: 'Get table by id'
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get table by identifier
  .get(
    '/identifier/:identifier',
    async function handler({ params }) {
      const result = await getTableByIdentifier(params.identifier)

      return {
        status: 200,
        message: 'Table found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(selectTableSchema)
      },
      params: t.Object({ identifier: t.String() })
    }
  )

  // Create new table
  .post(
    '',
    async function handler({ body, payload }) {
      const newBody = {
        ...body,
        idStore: payload.store
      }

      const result = await createTable(newBody)

      return {
        status: 201,
        message: 'Table created',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(selectTableSchema)
      },
      body: 'createTable'
    }
  )

  // Update table
  .put(
    '/:id',
    async function handler({ params, body }) {
      const result = await updateTable(params.id, body)

      return {
        status: 200,
        message: 'Table updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(selectTableSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateTable'
    }
  )

  // Delete table
  .delete(
    '/:id',
    async function handler({ params }) {
      const result = await deleteTable(params.id)

      return {
        status: 200,
        message: 'Table deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get table session by id
  .get(
    '/session/:id',
    async function handler({ params }) {
      const result = await getTableSessionById(params.id)

      return {
        status: 200,
        message: 'Table session found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(selectTableSessionSchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get table session by session token
  .get(
    '/session/token/:token',
    async function handler({ params }) {
      const result = await getTableSessionBySessionToken(params.token)

      return {
        status: 200,
        message: 'Table session found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(selectTableSessionSchema)
      },
      params: t.Object({ token: t.String() })
    }
  )

  // Delete table session
  .delete(
    '/session/:id',
    async function handler({ params }) {
      const result = await deleteTableSession(params.id)

      return {
        status: 200,
        message: 'Table session deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(t.Object({ id: t.Number() }))
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get all table sessions by table id
  .get(
    '/session/table/:tableId',
    async function handler({ params, query }) {
      const ascBySort = query.ascBySort ?? true
      const result = await getAllTableSessionsByTableId(
        params.tableId,
        ascBySort
      )

      return {
        status: 200,
        message: 'Table sessions found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(t.Array(selectTableSessionSchema))
      },
      params: t.Object({ tableId: t.Number() }),
      query: t.Object({
        ascBySort: t.Optional(t.Boolean())
      })
    }
  )

  .get(
    '/all',
    async function handler({ payload }) {
      const result = await getAllTablesByStoreId(payload.store)

      return {
        status: 200,
        message: 'Tables found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Table'],
        responses: SwaggerResponses(t.Array(selectTableSchema))
      }
    }
  )
