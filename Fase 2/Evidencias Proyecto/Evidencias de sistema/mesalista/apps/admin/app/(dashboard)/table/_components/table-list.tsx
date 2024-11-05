'use client'

import { useQuery } from '@tanstack/react-query'
import { getTables } from '../_lib/action'
import { ComboboxTable } from './combobox'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import TableItem from './table-item'
import useTableModal from '../_lib/use-open-modal'

const filters = [
  {
    value: '1',
    label: 'Capacidad 1'
  },
  {
    value: '2',
    label: 'Capacidad 2'
  }
]

export default function TableList() {
  const handleOpenCreateTableModal = useTableModal()
  const { data, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => getTables()
  })

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex justify-between items-center">
        <ComboboxTable data={filters} />
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleOpenCreateTableModal.onOpen()}
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Crear mesa
        </Button>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data?.data?.map((table) => <TableItem key={table.id} table={table} />)}
      </div>
    </div>
  )
}
