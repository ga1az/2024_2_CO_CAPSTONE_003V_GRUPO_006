'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import useInfoModal from '../_lib/use-open-info'
import { getDetailedInformationByRoundId } from '../_lib/actions'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { statusTranslations } from '../_lib/types'

export default function InfoModal() {
  const { onClose, isOpen, data: order } = useInfoModal()

  const { data, isLoading } = useQuery({
    queryKey: ['kitchen-items-orders-info', order?.idRound],
    queryFn: () =>
      order?.idRound ? getDetailedInformationByRoundId(order.idRound) : null,
    enabled: !!order // Solo ejecuta la query si existe order
  })

  if (!order) return null

  const onChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Detalle de la orden - #{order.idTableSession} - {order.idRound}{' '}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-[10vh] w-full" />
        ) : (
          <ScrollArea className="mt-4 max-h-[60vh]">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Mesa: {order.idTable}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Productos:</h4>
                <ul className="space-y-2">
                  {order.orderItem.map((item, index) => (
                    <li key={index} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span>${item.subtotal.toLocaleString()}</span>
                      </div>
                      {
                        <ul className="mt-1 ml-4 text-sm text-muted-foreground">
                          {data?.data
                            ?.filter(
                              (modifier) =>
                                modifier.orderItemId === item.idProduct
                            )
                            ?.flatMap(
                              (modifier) =>
                                modifier.modifiers?.map((mod, modIndex) => (
                                  <li
                                    key={`${item.idProduct}-${modIndex}`}
                                    className="flex justify-between"
                                  >
                                    <span>{mod.name}</span>
                                    <span>${mod.price?.toLocaleString()}</span>
                                  </li>
                                )) || []
                            )}
                        </ul>
                      }
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Monto Total:</span>
                <span>${Number(order.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Fecha:</span>
                <span>
                  {new Date(order.createdAt)
                    .toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour12: true
                    })
                    .replace(/\./g, '')
                    .toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Estado:</span>
                <span>
                  {
                    statusTranslations[
                      order.statusRound as keyof typeof statusTranslations
                    ]
                  }
                </span>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
