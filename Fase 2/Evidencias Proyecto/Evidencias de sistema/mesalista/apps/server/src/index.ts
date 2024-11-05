import { Elysia } from 'elysia'
import { Logestic } from 'logestic'
import { env } from '../env'
import swagger from '@elysiajs/swagger'
import cors from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'
import { httpPublic } from './http/public'
import { httpV1 } from './http/v1'
import errorMiddleware from './middlewares/error.middleware'

const app = new Elysia()
  .use(
    cors({
      // origin: ['http://localhost', 'http://localhost:5173'],
      methods: ['GET', 'PUT', 'POST', 'DELETE'],
      credentials: true,
      origin: /localhost.*/,
      // origin: (ctx) => ctx.headers.get('Origin'),
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Credentials',
        'Origin',
        'Host',
        'os'
      ]
    })
  )
  .use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'script-src': ["'self'", 'https://cdn.jsdelivr.net/']
        }
      }
    })
  )
  .state('timezone', env.TZ || 'America/Santiago')
  .use(errorMiddleware)
  .use(Logestic.preset('fancy'))
  .use(
    swagger({
      provider: 'scalar',
      autoDarkMode: true,
      documentation: {
        info: {
          title: 'MesaLista API',
          version: '0.0.1'
        },
        security: [{ JwtAuth: [] }],
        components: {
          securitySchemes: {
            JwtAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Enter JWT Bearer token **_only_**'
            }
          }
        }
      }
    })
  )
  .use(httpPublic)
  .use(httpV1)
  .listen(env.PORT)

let baseUrl = `http://${app.server?.hostname}:${app.server?.port}`
console.log(
  `🚀 Server is running at ${baseUrl}\n🐲 Swagger is running at ${baseUrl}/swagger`
)

export type App = typeof app
