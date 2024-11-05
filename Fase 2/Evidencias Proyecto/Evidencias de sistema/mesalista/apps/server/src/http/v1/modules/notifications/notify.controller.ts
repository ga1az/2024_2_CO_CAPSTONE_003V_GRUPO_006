import { Elysia, t } from 'elysia'

export const NotifyController = new Elysia({
  prefix: '/notify',
  websocket: {
    idleTimeout: 30
  }
}).ws('/', {
  body: t.String(),
  response: t.String(),
  // Manejar nueva conexión
  open(ws) {
    ws.subscribe('notify')
    ws.send('initial conect')
  },
  message(ws, message) {
    ws.publish('notify', message)
  },
  // Limpiar conexión cuando se cierra
  close(ws) {
    ws.unsubscribe('notify')
  }
})
