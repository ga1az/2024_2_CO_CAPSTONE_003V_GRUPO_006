import {
  insertCategorySchema,
  updateCategorySchema
} from '@mesalista/database/src/schema'
import { Static, t } from 'elysia'

export const updateCategoryDTO = t.Omit(updateCategorySchema, [
  'idStore',
  'updatedAt',
  'createdAt',
  'id'
])

export const insertCategoryDTO = t.Omit(insertCategorySchema, [
  'idStore',
  'updatedAt',
  'createdAt'
])

export const bulkUpdateCategoryDTO = t.Object({
  ids: t.Array(t.Number()),
  data: t.Omit(updateCategorySchema, [
    'id',
    'updatedAt',
    'createdAt',
    'idStore'
  ])
})

export type BulkUpdateCategoryDTO = Static<typeof bulkUpdateCategoryDTO>

export const updateReorderItem = t.Object({
  id: t.Number(),
  sort: t.Number()
})

export type UpdateReorderItem = Static<typeof updateReorderItem>

export const updateReorderCategory = t.Object({
  order: t.Array(updateReorderItem)
})

export type UpdateReorderCategory = Static<typeof updateReorderCategory>
