import Elysia, { redirect, t } from 'elysia'
import {
  createTableSession,
  findActiveSession,
  getSessionByQRCodeAndTmpCode,
  validateQRCode,
  validateSessionCode
} from './session.model'
import { decryptJSON } from '../../../utils/crypto'
import { QrCodeSchema } from '../../../utils'

export const SessionController = new Elysia({ prefix: '/session' })
  .get(
    '/id/:id',
    async function handler({ params }) {
      const isValidCode = await validateQRCode(params.id)

      if (!isValidCode) {
        throw new Error('Invalid code')
      }

      const activeSession = await findActiveSession(params.id)
      if (activeSession) {
        return redirect(`http://localhost:3001/store/6?qrcode=${params.id}`)
      }

      const result = await createTableSession(params.id)
      return redirect(
        `http://localhost:3001/store/6?qrcode=${params.id}&tmpcode=${result.tmpCode}`
      )
    },
    {
      detail: {
        summary: 'Create a new session',
        tags: ['session']
      },
      params: t.Object({
        id: t.String()
      }),
      query: t.Object({
        code: t.Optional(t.Number())
      })
    }
  )
  .get(
    '/validate/:id',
    async function handler({ params, query }) {
      const { id } = params
      const { code } = query

      // Primero validamos que el QR sea válido
      const isValidQR = await validateQRCode(id)
      if (!isValidQR) {
        throw new Error('Invalid QR code')
      }
      // Buscamos la sesión activa
      const sessionId = await findActiveSession(id)
      if (!sessionId) {
        throw new Error('No active session found')
      }

      const decryptedQRCode: QrCodeSchema = await decryptJSON(id)
      // Si no se proporciona código, solo validamos que exista la sesión
      if (!code || code === 'null') {
        return {
          valid: true,
          requiresCode: true,
          tableId: decryptedQRCode.identifier
        }
      }

      // Si se proporciona código, validamos que coincida
      const isValidSession = await validateSessionCode(sessionId, code)
      if (!isValidSession) {
        throw new Error('Invalid session code')
      }

      return {
        valid: true,
        requiresCode: false,
        tableId: decryptedQRCode.identifier
      }
    },
    {
      detail: {
        summary: 'Validate session',
        tags: ['session']
      },
      params: t.Object({
        id: t.String()
      }),
      query: t.Object({
        code: t.Optional(t.String())
      })
    }
  )
  .ws('/live', {
    async beforeHandle(ws) {
      const { room, qrCode } = ws.query
      const result = await getSessionByQRCodeAndTmpCode(qrCode, room)
      if (!result) {
        throw new Error('No active session found')
      }
    },
    open(ws) {
      const { room, name } = ws.data.query
      ws.subscribe(room).publish(room, {
        message: `${name} entro en la sesión`,
        name: 'entrada'
      })
    },
    async message(ws, message) {
      const { room, name } = ws.data.query
      ws.publish(room, {
        message,
        name
      })
    },
    close(ws) {
      const { room, name } = ws.data.query
      ws.unsubscribe(room).publish(room, {
        message: `${name} salió de la sesión`,
        name: 'salida'
      })
    },
    query: t.Object({
      room: t.String(),
      name: t.String(),
      qrCode: t.String()
    }),

    body: t.String()
  })
