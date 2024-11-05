'use client'
'use memo'

import * as React from 'react'
import { SelectProductSchema } from '@mesalista/database/src/schema'
import { type DataTableFilterField } from '@/types'

import { useDataTable } from '@/hooks/use-data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/advanced/data-table-advanced-toolbar'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { getProducts } from '../_lib/actions'
import { getStatusIcon } from '../_lib/utils'
import { getColumns } from './products-table-columns'
import { ProductsTableFloatingBar } from './products-table-floating-bar'
import { useproductsTable } from './products-table-provider'
import { ProductsTableToolbarActions } from './products-table-toolbar-actions'

interface productsTableProps {
  productsPromise: ReturnType<typeof getProducts>
}

export function ProductsTable({ productsPromise }: productsTableProps) {
  // Feature flags for showcasing some additional features. Feel free to remove them.
  const { featureFlags } = useproductsTable()

  const { data, pagination } = React.use(productsPromise)

  // Memoize the columns so they don't re-render on every render
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
  const filterFields: DataTableFilterField<SelectProductSchema>[] = [
    {
      label: 'Name',
      value: 'name',
      placeholder: 'Filter name...'
    },
    {
      label: 'Description',
      value: 'description',
      placeholder: 'Filter description...'
    },
    {
      label: 'Status',
      value: 'isActive',
      options: [
        {
          label: 'Active',
          value: 'true',
          icon: getStatusIcon(true)
        },
        {
          label: 'Inactive',
          value: 'false',
          icon: getStatusIcon(false)
        }
      ]
    }
  ]

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount: pagination?.pageCount ?? 1,
    /* optional props */
    filterFields,
    enableAdvancedFilter: featureFlags.includes('advancedFilter'),
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    // For remembering the previous row selection on page change
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`
    /* */
  })

  return (
    <DataTable
      table={table}
      floatingBar={
        featureFlags.includes('floatingBar') ? (
          <ProductsTableFloatingBar table={table} />
        ) : null
      }
    >
      {featureFlags.includes('advancedFilter') ? (
        <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
          <ProductsTableToolbarActions table={table} />
        </DataTableAdvancedToolbar>
      ) : (
        <DataTableToolbar table={table} filterFields={filterFields}>
          <ProductsTableToolbarActions table={table} />
        </DataTableToolbar>
      )}
    </DataTable>
  )
}
