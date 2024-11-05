import { Shell } from '@/components/shell'
import { ProductsTable } from './_components/products-table'
import { ProductsTableProvider } from './_components/products-table-provider'
import React from 'react'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
//import { DateRangePicker } from '@/components/date-range-picker'
//import { Skeleton } from '@/components/ui/skeleton'
import { searchParamsSchema } from './_lib/validations'
import { getProducts } from './_lib/actions'
import { SearchParams } from '@/types'

export interface ProductsPageProps {
  searchParams: SearchParams
}

export default async function ProductsPage({
  searchParams
}: ProductsPageProps) {
  const search = searchParamsSchema.parse(searchParams)

  const ProductsPromise = getProducts({
    page: search.page,
    pageSize: search.per_page,
    orderBy: search.sort || '',
    filters: search.filters || '',
    select: ''
  })
  return (
    <Shell className="gap-4">
      <ProductsTableProvider>
        {/**
         * The `DateRangePicker` component is used to render the date range picker UI.
         * It is used to filter the tasks based on the selected date range it was created at.
         * The business logic for filtering the tasks based on the selected date range is handled inside the component.
         */}
        {/* <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
          <DateRangePicker
            triggerSize="sm"
            triggerClassName="ml-auto w-56 sm:w-60"
            align="end"
          />
        </React.Suspense> */}
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={4}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={['10rem', '40rem', '12rem', '12rem', '8rem']}
              shrinkZero
            />
          }
        >
          {/**
           * Passing promises and consuming them using React.use for triggering the suspense fallback.
           * @see https://react.dev/reference/react/use
           */}
          <ProductsTable productsPromise={ProductsPromise} />
        </React.Suspense>
      </ProductsTableProvider>
    </Shell>
  )
}
