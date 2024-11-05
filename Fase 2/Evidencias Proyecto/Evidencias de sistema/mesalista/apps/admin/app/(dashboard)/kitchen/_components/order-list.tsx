'use client'

import { Badge } from '@/components/ui/badge'
import OrderItem from './order-item'
import React, { useState } from 'react'
import { orderStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { getKitchenItemsOrders } from '../_lib/actions'
import SkeletonItem from './skeleton-item'
import { AlertCircle } from 'lucide-react'
import InfoModal from './info-modal'
import { DateRange } from 'react-day-picker'
import { addDays, format } from 'date-fns'
import { DatePickerWithRange } from './date-range'
import { api } from '@mesalista/api'
import { toast } from 'sonner'

export default function OrderList() {
  const [status, setStatus] = useState<
    'pending' | 'in_progress' | 'completed' | 'cancelled' | 'delivered' | ''
  >('pending')

  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 1)
  })

  const { data, isLoading } = useQuery({
    queryKey: ['kitchen-items-orders', status, date.from, date.to],
    queryFn: () => {
      const startDate = format(date.from!, 'yyyy-MM-dd')
      const endDate = format(date.to!, 'yyyy-MM-dd')

      return getKitchenItemsOrders(
        startDate,
        endDate,
        status === '' ? undefined : status
      )
    },
    refetchInterval: 5000,
    enabled: !!date.from && !!date.to // Solo ejecuta la query si ambas fechas están definidas
  })

  const [wsClient, setWsClient] = React.useState<any>(null)

  React.useEffect(() => {
    const client = api.v1.notify.index.subscribe()
    setWsClient(client)

    client.subscribe((message) => {
      if (!message.data.includes('initial conect')) {
        toast.success(message.data)
      }
    })

    return () => {
      client.close()
    }
  }, [])

  const handleChangeStatusToCompleted = (newStatus: string) => {
    wsClient?.send('Hay una nueva orden completada')
  }
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <AlertCircle className="h-10 w-10 mb-4" />
      <h3 className="font-medium text-lg mb-1">No hay órdenes</h3>
      <p className="text-sm">
        No se encontraron órdenes con el estado "
        {orderStatus.find((s) => s.value === status)?.label}"
      </p>
    </div>
  )

  return (
    <div className="mt-4">
      <DatePickerWithRange
        date={date}
        onDateChange={(newDate) => newDate && setDate(newDate)}
        className="mb-4"
      />
      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 overflow-x-auto ">
        {orderStatus.map((statusItem) => (
          <Badge
            onClick={() => setStatus(statusItem.value as any)}
            key={statusItem.value}
            className={cn(
              'cursor-pointer whitespace-nowrap min-w-fit shrink-0',
              'text-xs sm:text-sm md:text-base',
              'p-2 sm:p-3 px-3 sm:px-4 md:px-5',
              'hover:bg-secondary-foreground hover:text-secondary transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              statusItem.value === status &&
                'bg-secondary-foreground text-secondary'
            )}
            variant="outline"
          >
            {statusItem.label}
          </Badge>
        ))}
      </div>
      {isLoading ? (
        <SkeletonItem />
      ) : !data?.data?.length ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {data?.data?.map((order) => (
            <OrderItem
              key={`${order.idRound}-${order.idTableSession}`}
              order={order}
              onStatusChange={handleChangeStatusToCompleted}
            />
          ))}
        </div>
      )}
      <InfoModal />
    </div>
  )
}
