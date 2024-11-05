import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { SelectTableSchema } from '@mesalista/database/src/schema'
import { Circle, EditIcon, Square, Triangle, QrCodeIcon } from 'lucide-react'
import { DotsHorizontalIcon, SwitchIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import useTableModal from '../_lib/use-open-modal'
import useTableQRModal from '../_lib/use-open-qr-modal'
import { updateTable } from '../_lib/action'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function TableItem({ table }: { table: SelectTableSchema }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-4 gap-4 sm:gap-0">
      <div className="flex items-center gap-4 sm:gap-7 w-full sm:w-auto">
        <div className="select-none border rounded-full p-3 border-green-600 shrink-0">
          {getTableIcon(table.capacity)}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="truncate">Mesa: {table.identifier}</p>
          <p className="text-base text-gray-500">Capacidad: {table.capacity}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto justify-between sm:justify-end">
        {table.isActive ? (
          <Badge
            variant="outline"
            className="text-xs sm:text-sm bg-green-500 cursor-pointer select-none text-white border-2 border-green-800 whitespace-nowrap"
          >
            Activa
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs sm:text-sm bg-red-500 cursor-pointer select-none text-white border-2 border-red-800 whitespace-nowrap"
          >
            Inactiva
          </Badge>
        )}
        <DropdownTable table={table} />
      </div>
    </div>
  )
}

function DropdownTable({ table }: { table: SelectTableSchema }) {
  const [open, setOpen] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const tableModal = useTableModal()
  const qrModal = useTableQRModal()
  const queryClient = useQueryClient()

  const { mutate: deleteTableMutation } = useMutation({
    mutationFn: async () => {
      return await updateTable({ isDeleted: true }, table.id)
    },
    onSuccess: () => {
      setShowDeleteDialog(false)
      // Invalida la caché de las mesas para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Mesa borrada exitosamente')
    },
    onError: (error) => {
      toast.error('Error al borrar la mesa')
    }
  })

  const updateTableMutation = useMutation({
    mutationFn: async () => {
      return await updateTable({ isActive: !table.isActive }, table.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Mesa actualizada exitosamente')
    }
  })

  const handleDelete = () => {
    deleteTableMutation()
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <DotsHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Configuración</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => tableModal.onOpen(table)}>
              <EditIcon className="mr-2 size-4" aria-hidden="true" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => qrModal.onOpen(table.id, table.qrCode!)}
            >
              <QrCodeIcon className="mr-2 size-4" aria-hidden="true" />
              Codigo QR
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateTableMutation.mutate()}>
              <SwitchIcon className="mr-2 size-4" aria-hidden="true" />
              Cambiar estado
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setShowDeleteDialog(true)}
            >
              Borrar
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              mesa {table.identifier}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Borrar mesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const getTableIcon = (capacity: number) => {
  switch (true) {
    case capacity <= 2:
      return <Triangle className="size-4" />
    case capacity <= 4:
      return <Circle className="size-4" />
    case capacity >= 6:
      return <Square className="size-4" />
    default:
      return <Triangle className="size-4" />
  }
}
