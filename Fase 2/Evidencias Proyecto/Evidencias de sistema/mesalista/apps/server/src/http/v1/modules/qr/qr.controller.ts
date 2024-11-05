import Elysia, { t } from 'elysia'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import {
  insertQRSchema,
  selectQRSchema,
  updateQRSchema
} from '@mesalista/database/src/schema'
import { SwaggerResponses } from '../../../../utils'
import { getQRByOrgId, insertQR, updateQR } from './qr.model'

export const QrController = new Elysia({ prefix: '/qr' })
  .use(isAuthenticated)
  .model({
    createQR: insertQRSchema,
    updateQR: updateQRSchema
  })
  .post(
    '/',
    async function handler({ body, payload }) {
      const result = await insertQR(body, payload.store)

      return {
        status: 201,
        message: 'QR created',
        data: result
      }
    },
    {
      detail: {
        tags: ['QR'],
        responses: SwaggerResponses(insertQRSchema)
      },
      body: 'createQR'
    }
  )
  .get(
    '/',
    async function handler({ payload }) {
      const result = await getQRByOrgId(payload.store)

      return {
        status: 200,
        message: 'QR found',
        data: result
      }
    },
    {
      detail: {
        tags: ['QR'],
        responses: SwaggerResponses(selectQRSchema)
      }
    }
  )
  .put(
    '/id/:id',
    async function handler({ params, body, payload }) {
      const result = await updateQR(params.id, body, payload.store)

      return {
        status: 200,
        message: 'QR updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['QR'],
        responses: SwaggerResponses(selectQRSchema)
      },
      params: t.Object({
        id: t.Numeric()
      }),
      body: 'updateQR'
    }
  )
