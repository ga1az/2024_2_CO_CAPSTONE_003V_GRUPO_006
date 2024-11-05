'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import useTableQRModal from '../_lib/use-open-qr-modal'
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
import CreateQRForm from './create-qr-form'

export default function CreateQRDialog() {
  const { isOpen, onClose } = useTableQRModal()
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
            <DialogTitle>Visualiza tu QR</DialogTitle>
          </DialogHeader>
          <CreateQRForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onChange}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Visualiza tu QR</DrawerTitle>
        </DrawerHeader>
        <CreateQRForm />
      </DrawerContent>
    </Drawer>
  )
}
