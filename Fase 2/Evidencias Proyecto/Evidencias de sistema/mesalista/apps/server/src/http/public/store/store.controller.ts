import Elysia, { t } from 'elysia'
import { getAllInfoByStoreId, getAllStores } from './store.service'
import { SwaggerResponses } from '../../../utils'
import { selectTableSchema } from '@mesalista/database/src/schema'
import { getAllTablesByStoreId } from '../../v1/modules/table/table.model'

export const StoreController = new Elysia({ prefix: '/store' })
  .get(
    '/id/:id',
    async function handler({ params }) {
      const storeId = params.id
      // const paginationParams: PaginationParams = {
      //   page: query.page ?? 1,
      //   pageSize: query.pageSize ?? 10
      // }
      // const baseUrl = getBaseUrl(request.url)

      const result = await getAllInfoByStoreId(storeId)

      return {
        status: 200,
        message: 'Store info found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Client Store']
      },
      params: t.Object({
        id: t.Number()
      })
      // query: t.Object({
      //   page: t.Optional(t.Number()),
      //   pageSize: t.Optional(t.Number()),
      //   orderBy: t.Optional(t.String())
      // })
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
        tags: ['Client Store']
      }
    }
  )

  .get(
    '/tables/:id',
    async function handler({ params }) {
      const result = await getAllTablesByStoreId(params.id)

      return {
        status: 200,
        message: 'Tables found',
        data: result
      }
    },
    {
      detail: {
        tags: ['Client Store'],
        responses: SwaggerResponses(t.Array(selectTableSchema))
      },
      params: t.Object({
        id: t.Number()
      })
    }
  )
