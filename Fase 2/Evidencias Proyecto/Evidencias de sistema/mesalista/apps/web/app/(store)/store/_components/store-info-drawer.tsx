'use client'

import { Store } from '../_lib/schemas'
import { Button } from '@/components/ui/button'
import { Info, X } from 'lucide-react'
import OpeningHours from './opening-hours'
import StoreInfo from './store-info'
import { motion } from 'framer-motion'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

interface StoreInfoDrawerProps {
  store: Store
}

export function StoreInfoDrawer({ store }: StoreInfoDrawerProps) {
  const { isDesktop, isTablet } = useMediaQuery()
  const isLargeScreen = isDesktop || isTablet

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
        >
          <Info className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className={cn('p-0', isLargeScreen && 'max-h-[85vh]')}>
        <div
          className={cn(
            'mx-auto w-full relative',
            isLargeScreen ? 'max-w-5xl' : 'max-w-lg'
          )}
        >
          <DrawerHeader className="pr-12">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
            <DrawerTitle>Información de {store.name}</DrawerTitle>
            <DrawerDescription>
              Horarios y detalles de contacto
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">
            <div
              className={cn(
                'space-y-6',
                isLargeScreen && 'grid grid-cols-2 gap-6 space-y-0'
              )}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StoreInfo store={store} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <OpeningHours hours={store.openingHours} />
              </motion.div>
            </div>
          </div>
          {!isLargeScreen && (
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
