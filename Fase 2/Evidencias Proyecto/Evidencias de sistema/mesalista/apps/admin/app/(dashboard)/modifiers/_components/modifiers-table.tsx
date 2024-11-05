'use client'
'use memo'

import * as React from 'react'
import { SelectModifierResponseSchema } from '@mesalista/database/src/schema'
import { type DataTableFilterField } from '@/types'

import { useDataTable } from '@/hooks/use-data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/advanced/data-table-advanced-toolbar'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { getModifiers } from '../_lib/actions'
// import { getStatusIcon } from '../_lib/utils'
import { getColumns } from './modifiers-table-columns'
// import { ModifiersTableFloatingBar
import { useModifiersTable } from './modifiers-table-provider'
import { ModifiersTableToolbarActions } from './modifiers-table-toolbar-actions'
import { ModifiersTableFloatingBar } from './modifiers-table-floating-bar'

interface ModifiersTableProps {
  ModifiersPromise: ReturnType<typeof getModifiers>
}

export function ModifiersTable({ ModifiersPromise }: ModifiersTableProps) {
  const { featureFlags } = useModifiersTable()
  const { data: initialData, pagination: initialPagination } =
    React.use(ModifiersPromise)
  const [data, setData] = React.useState(initialData ?? [])
  const columns = React.useMemo(() => getColumns(), [])

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<SelectModifierResponseSchema>[] = [
    {
      label: 'Name',
      value: 'name',
      placeholder: 'Filter name...'
    }
  ]
  const [reorderItems, setReorderItems] = React.useState<
    SelectModifierResponseSchema[]
  >([])

  const updateItems = React.useCallback(
    (updatedItem: SelectModifierResponseSchema) => {
      setData((prevItems) =>
        prevItems.map((item) =>
          item.id === updatedItem.id ? { ...item, ...updatedItem } : item
        )
      )
    },
    []
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount: initialPagination?.pageCount ?? 1,
    filterFields,
    enableAdvancedFilter: featureFlags.includes('advancedFilter'),
    initialState: {
      columnPinning: { right: ['actions'] },
      sorting: [{ id: 'id', desc: true }]
    },
    getRowId: (originalRow) => originalRow.id?.toString() ?? '',
    meta: {
      updateData: (
        rowIndex: number,
        newData: Partial<SelectModifierResponseSchema>
      ) => {
        const updatedItem = {
          ...data[rowIndex],
          ...newData
        }
        updateItems(updatedItem)
      }
    }
  })

  // Effect to update data when pagination, sorting, or filters change
  React.useEffect(() => {
    setData(initialData ?? [])
  }, [initialData])

  return (
    <DataTable
      table={table}
      enableSorting={true}
      floatingBar={
        featureFlags.includes('floatingBar') ? (
          <ModifiersTableFloatingBar table={table} />
        ) : null
      }
    >
      {featureFlags.includes('advancedFilter') ? (
        <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
          <ModifiersTableToolbarActions table={table} />
        </DataTableAdvancedToolbar>
      ) : (
        <DataTableToolbar table={table} filterFields={filterFields}>
          <ModifiersTableToolbarActions table={table} />
        </DataTableToolbar>
      )}
    </DataTable>
  )
}
