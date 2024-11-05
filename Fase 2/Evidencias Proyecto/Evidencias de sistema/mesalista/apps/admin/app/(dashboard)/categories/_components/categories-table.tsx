'use client'
'use memo'

import * as React from 'react'
import { InsertCategorySchema } from '@mesalista/database/src/schema'
import { type DataTableFilterField } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import { useDataTable } from '@/hooks/use-data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/advanced/data-table-advanced-toolbar'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { getCategories, reorderCategories } from '../_lib/actions'
import { getStatusIcon } from '../_lib/utils'
import { getColumns } from './categories-table-columns'
import { CategoriesTableFloatingBar } from './categories-table-floating-bar'
import { useCategoriesTable } from './categories-table-provider'
import { CategoriesTableToolbarActions } from './categories-table-toolbar-actions'

import { useDebounce } from '@/hooks/use-debounce'

interface CategoriesTableProps {
  CategoriesPromise: ReturnType<typeof getCategories>
}

export function CategoriesTable({ CategoriesPromise }: CategoriesTableProps) {
  const { featureFlags } = useCategoriesTable()
  const { data: initialData, pagination: initialPagination } =
    React.use(CategoriesPromise)
  const [data, setData] = React.useState(initialData ?? [])
  const columns = React.useMemo(() => getColumns(), [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

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
  const filterFields: DataTableFilterField<InsertCategorySchema>[] = [
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
  const [reorderItems, setReorderItems] = React.useState<
    InsertCategorySchema[]
  >([])

  const debouncedReorderItems = useDebounce(reorderItems, 500)

  React.useEffect(() => {
    if (debouncedReorderItems.length > 0) {
      reorderCategories({
        order: debouncedReorderItems
          .filter((item) => item.id !== undefined && item.sort !== undefined)
          .map((item) => ({
            id: item.id as number,
            sort: item.sort as number
          }))
      })
    }
  }, [debouncedReorderItems])

  const handleDragEnd = React.useCallback(
    (event: { active: any; over: any }) => {
      const { active, over } = event

      if (active.id !== over.id) {
        setData((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id)
          const newIndex = items.findIndex((item) => item.id === over.id)
          const newItems = arrayMove(items, oldIndex, newIndex)

          const updatedItems = newItems.map((item, index) => ({
            ...item,
            sort: index + 1
          }))

          setReorderItems(updatedItems)

          return updatedItems
        })
      }
    },
    []
  )

  const updateItems = React.useCallback((updatedItem: InsertCategorySchema) => {
    setData((prevItems) =>
      prevItems.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      )
    )
  }, [])

  const { table } = useDataTable({
    data,
    columns,
    pageCount: initialPagination?.pageCount ?? 1,
    filterFields,
    enableAdvancedFilter: featureFlags.includes('advancedFilter'),
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id?.toString() ?? '',
    meta: {
      updateData: (
        rowIndex: number,
        newData: Partial<InsertCategorySchema>
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      id="categories-table"
    >
      <SortableContext
        items={data.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <DataTable
          table={table}
          enableSorting={true}
          floatingBar={
            featureFlags.includes('floatingBar') ? (
              <CategoriesTableFloatingBar table={table} />
            ) : null
          }
        >
          {featureFlags.includes('advancedFilter') ? (
            <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
              <CategoriesTableToolbarActions table={table} />
            </DataTableAdvancedToolbar>
          ) : (
            <DataTableToolbar table={table} filterFields={filterFields}>
              <CategoriesTableToolbarActions table={table} />
            </DataTableToolbar>
          )}
        </DataTable>
      </SortableContext>
    </DndContext>
  )
}
