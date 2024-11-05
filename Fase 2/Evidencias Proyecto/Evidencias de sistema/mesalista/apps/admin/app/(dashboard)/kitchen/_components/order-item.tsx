'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  RoundStatus,
  SelectOrderItemsDto
} from '@mesalista/database/src/schema'
import { Clock, Triangle } from 'lucide-react'
import { updateRoundStatus } from '../_lib/actions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { statusTranslations } from '../_lib/types'
import useInfoModal from '../_lib/use-open-info'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/use-user'

interface OrderItemProps {
  order: SelectOrderItemsDto
  onStatusChange: (newStatus: string) => void
}

export default function OrderItem({ order, onStatusChange }: OrderItemProps) {
  const handleOpenInfoModal = useInfoModal()
  const { user, loading } = useUser()

  const statusActionsKitchen = {
    pending: [{ next: 'in_progress', label: 'En Preparación', color: 'amber' }],
    in_progress: [
      { next: 'pending', label: 'Regresar a Pendiente', color: 'gray' },
      { next: 'completed', label: 'Listo', color: 'emerald' }
    ],
    completed: [
      { next: 'in_progress', label: 'Regresar a Preparación', color: 'amber' }
    ]
  } as const

  const statusActionsWaiter = {
    completed: [{ next: 'delivered', label: 'Entregada', color: 'emerald' }],
    delivered: [
      { next: 'completed', label: 'Regresar a Listo', color: 'emerald' }
    ]
  } as const

  const getAvailableActions = () => {
    if (loading || !user) return []

    if (user.role === 'waiter') {
      return (
        statusActionsWaiter[
          order.statusRound as keyof typeof statusActionsWaiter
        ] || []
      )
    }

    if (user.role === 'kitchen') {
      return (
        statusActionsKitchen[
          order.statusRound as keyof typeof statusActionsKitchen
        ] || []
      )
    }

    // Para admin, mostrar todas las acciones disponibles
    return [
      ...(statusActionsKitchen[
        order.statusRound as keyof typeof statusActionsKitchen
      ] || []),
      ...(statusActionsWaiter[
        order.statusRound as keyof typeof statusActionsWaiter
      ] || [])
    ]
  }

  const queryClient = useQueryClient()

  const createUpdateMutation = useMutation({
    mutationFn: (data: Required<{ status: RoundStatus; roundId: number }>) =>
      updateRoundStatus(data.roundId, data.status),
    onSuccess: () => {
      toast.success('Orden actualizada correctamente')
      queryClient.invalidateQueries({ queryKey: ['kitchen-items-orders'] })
    }
  })

  const handleUpdateRoundStatus = async (status: RoundStatus) => {
    createUpdateMutation.mutate({ status, roundId: order.idRound })
    if (status === 'completed') {
      onStatusChange(status)
    }
  }

  return (
    <div
      className="border rounded-lg p-5 flex flex-col cursor-pointer select-none max-w-[300px]"
      onClick={() => handleOpenInfoModal.onOpen(order)}
    >
      <div className="flex flex-row justify-between items-center">
        <p className="font-bold">
          Orden #{order.idTableSession} - {order.idRound}{' '}
        </p>
        <Badge
          variant="outline"
          className="cursor-pointer px-5 py-2 rounded-full bg-blue-400/10 text-blue-400 font-bold hover:bg-blue-400/20"
        >
          {
            statusTranslations[
              order.statusRound as keyof typeof statusTranslations
            ]
          }
        </Badge>
      </div>
      <Separator className="my-5" />
      <div className="flex flex-col gap-2">
        <p className="flex flex-row gap-2 items-center text-gray-300">
          <Clock className="w-4 h-4" />
          {new Date(order.createdAt)
            .toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
            .replace(/\./g, '')
            .toUpperCase()}
          {', '}
          {new Date(order.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </p>
        <p className="flex flex-row gap-2 items-center text-gray-300 font-bold">
          <Triangle className="w-4 h-4" />
          Mesa {order.idTable}
        </p>
      </div>
      <Separator className="my-5" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between font-bold">
          <p>
            {order.orderItem.length} Producto
            {order.orderItem.length > 1 ? 's' : ''}
          </p>
          <p className="text-green-400">
            ${order.totalAmount.toLocaleString()}
          </p>
        </div>
        {order.orderItem.map((item) => (
          <div
            className="flex flex-row justify-between text-muted-foreground"
            key={`${item.id}-${item.idProduct}`}
          >
            <p>{item.productName}</p>
            <p>${item.subtotal.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <Separator className="my-5" />

      {!loading && user && (
        <div className="flex flex-wrap gap-2">
          {getAvailableActions().map((action) => (
            <Button
              key={action.next}
              className={cn(
                'flex-1 text-white font-bold py-3 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2',
                {
                  'bg-amber-600 hover:bg-amber-700 border-amber-700':
                    action.color === 'amber',
                  'bg-gray-600 hover:bg-gray-700 border-gray-700':
                    action.color === 'gray',
                  'bg-emerald-600 hover:bg-emerald-700 border-emerald-700':
                    action.color === 'emerald'
                }
              )}
              onClick={(e) => {
                e.stopPropagation()
                handleUpdateRoundStatus(action.next)
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
