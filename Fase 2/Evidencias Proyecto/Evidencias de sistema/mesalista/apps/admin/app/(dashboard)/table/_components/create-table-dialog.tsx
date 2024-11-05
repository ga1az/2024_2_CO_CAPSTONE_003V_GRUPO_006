'use client'

import useTableModal from '../_lib/use-open-modal'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useMediaQuery } from '@/hooks/use-media-query'
import CreateTableForm from './create-table-form'

export default function CreateTableDialog() {
  const { isOpen, onClose } = useTableModal()
  const isDesktop = useMediaQuery()
  const onChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Mesa</DialogTitle>
            <DialogDescription>
              Ingresa los datos de la mesa que deseas crear.
            </DialogDescription>
          </DialogHeader>
          <CreateTableForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onChange}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Crear Mesa</DrawerTitle>
          <DrawerDescription>
            Ingresa los datos de la mesa que deseas crear.
          </DrawerDescription>
        </DrawerHeader>
        <CreateTableForm />
      </DrawerContent>
    </Drawer>
  )
}
