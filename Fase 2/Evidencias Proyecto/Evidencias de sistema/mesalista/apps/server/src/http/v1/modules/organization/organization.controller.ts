import { Elysia, t } from 'elysia'
import {
  getOrganizationById,
  getOrganizationBySlug,
  updateOrganization
} from './organization.model'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import { SwaggerResponses } from '../../../../utils'
import {
  selectOrganizationSchema,
  updateOrganizationSchema
} from '@mesalista/database/src/schema'

export const OrganizationController = new Elysia({ prefix: '/organization' })
  .use(isAuthenticated)
  .model({
    updateOrganization: updateOrganizationSchema
  })

  // Get organization by id
  .get(
    '/:id',
    async function handler({ params }) {
      const result = await getOrganizationById(params.id)

      return {
        status: 200,
        message: 'Organization found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Organization'],
        responses: SwaggerResponses(selectOrganizationSchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get organization by slug
  .get(
    '/slug/:slug',
    async function handler({ params }) {
      const result = await getOrganizationBySlug(params.slug)

      return {
        status: 200,
        message: 'Organization found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Organization'],
        responses: SwaggerResponses(selectOrganizationSchema)
      },
      params: t.Object({ slug: t.String() })
    }
  )

  // Update organization
  .put(
    '/:id',
    async function handler({ params, body }) {
      const result = await updateOrganization(params.id, body)

      return {
        status: 200,
        message: 'Organization updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Organization'],
        responses: SwaggerResponses(selectOrganizationSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateOrganization'
    }
  )
