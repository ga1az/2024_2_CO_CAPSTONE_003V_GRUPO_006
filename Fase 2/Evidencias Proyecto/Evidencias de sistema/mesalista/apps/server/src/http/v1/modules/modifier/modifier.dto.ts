import {
  insertModifierOptionSchema,
  insertModifierSchema,
  updateModifierSchema
} from '@mesalista/database/src/schema'
import { t, Static } from 'elysia'

const insertModifierOptionEditSchema = t.Omit(insertModifierOptionSchema, [
  'idModifier'
])

export const createModifierDto = t.Intersect([
  insertModifierSchema,
  t.Object({ idProducts: t.Optional(t.Array(t.Number())) }),
  t.Object({
    options: t.Array(insertModifierOptionEditSchema)
  })
])

export type CreateModifierDto = Static<typeof createModifierDto>

export const updateModifierDTO = t.Omit(updateModifierSchema, ['idStore'])

export const insertModifierDTO = t.Omit(insertModifierSchema, ['idStore'])

export const insertModifierOptionWithoutIdOptSchema = t.Omit(
  createModifierDto,
  ['idStore', 'updatedAt', 'createdAt', 'id']
)

export const getAllModifiersDTO = t.Intersect([
  insertModifierSchema,

  t.Object({
    products: t.Array(
      t.Object({
        name: t.String(),
        idProduct: t.Number()
      })
    )
  }),

  t.Object({
    options: t.Array(
      t.Object({
        name: t.String(),
        idOption: t.Optional(t.Number()),
        overcharge: t.Number()
      })
    )
  })
])

export const updateModifierOptionDto = t.Partial(getAllModifiersDTO)

export type UpdateModifierOptionDto = Static<typeof updateModifierOptionDto>

export const bulkDeleteModifierDTO = t.Object({
  ids: t.Array(t.Number())
})

export type BulkDeleteModifierDTO = Static<typeof bulkDeleteModifierDTO>

export const bulkUpdateModifierDTO = t.Object({
  ids: t.Array(t.Number()),
  data: t.Omit(updateModifierSchema, [
    'id',
    'createdAt',
    'updatedAt',
    'idStore'
  ])
})

export type BulkUpdateModifierDTO = Static<typeof bulkUpdateModifierDTO>
