'use client'

import { useTable, useStore } from '../_lib/queries'
import { TableQR } from '../_components/table-qr'
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

interface TablePageProps {
  params: {
    storeId: string
  }
}

export default function TablePage({ params }: TablePageProps) {
  const searchParams = useSearchParams()
  const tableIdentifier = searchParams.get('identifier') ?? ''

  const {
    data: tableResponse,
    isLoading: isLoadingTable,
    error: tableError
  } = useTable(params.storeId, tableIdentifier)

  const {
    data: storeResponse,
    isLoading: isLoadingStore,
    error: storeError
  } = useStore(params.storeId)

  if (isLoadingTable || isLoadingStore) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-[200px] mx-auto" />
          <Skeleton className="h-[400px] w-[400px]" />
        </div>
      </div>
    )
  }

  if (
    tableError ||
    storeError ||
    !tableResponse?.data ||
    !storeResponse?.data
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          {tableError?.message ||
            storeError?.message ||
            'Error cargando la información'}
        </div>
      </div>
    )
  }

  // Encontrar la mesa correcta por el identificador
  const table = tableResponse.data.find((t) => t.identifier === tableIdentifier)

  if (!table) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          Mesa no encontrada
        </div>
      </div>
    )
  }

  return <TableQR table={table} storeName={storeResponse.data.name} />
}
