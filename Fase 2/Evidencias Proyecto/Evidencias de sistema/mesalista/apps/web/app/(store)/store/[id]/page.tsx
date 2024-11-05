'use client'

import { useState, useEffect } from 'react'
import { useStore } from '../_lib/queries'
import StoreHeader from '../_components/store-header'
import { Skeleton } from '@/components/ui/skeleton'
import { CategorySection } from '@/components/store/category-section'
import { CategoryTabs } from '@/components/store/category-tabs'
import { motion } from 'framer-motion'
import { StoreInfoDrawer } from '../_components/store-info-drawer'
import { CartProvider } from '@/context/store-cart-context'
import { StoreCart } from '../_components/store-cart'
import { api } from '@mesalista/api'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import useValidStoreCode from '../../_lib/use-valid-code'
import { ValidateCodeDialog } from '../_components/validate-code-dialog'
import { InviteCodeDrawer } from '../_components/invite-code-drawer'
import useUser from '../../_lib/use-user'

interface StorePageProps {
  params: {
    id: string
  }
}

export default function StorePage({ params }: StorePageProps) {
  const searchParams = useSearchParams()
  const { data: response, isLoading, error } = useStore(params.id)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [wsClient, setWsClient] = useState<any>(null)
  const [showInviteDrawer, setShowInviteDrawer] = useState(true)

  const { isValid, needsCode, tableId, onValidateCode } = useValidStoreCode()
  const { initialize, name } = useUser()

  // Efecto para manejar la categoría activa y validación inicial
  useEffect(() => {
    if (response?.data?.items?.[0]) {
      setActiveCategory(response.data.items[0].id.toString())
    }

    initialize()

    onValidateCode(
      searchParams.get('qrcode') as string,
      searchParams.get('tmpcode') as string
    )
  }, [response?.data?.items, searchParams, initialize])

  // Efecto separado para manejar la conexión WebSocket
  useEffect(() => {
    let client: any = null

    const initializeWebSocket = async () => {
      if (isValid && !needsCode) {
        const tmpcode = searchParams.get('tmpcode')
        const qrcode = searchParams.get('qrcode')

        if (!tmpcode || !qrcode) return

        client = api.public.session.live.subscribe({
          query: {
            room: tmpcode,
            name: name,
            qrCode: qrcode
          }
        })
        setWsClient(client)

        try {
          client.subscribe((message: any) => {
            if (message.data.name === 'entrada') {
              toast.success(message.data.message)
            } else if (message.data.name === 'salida') {
              toast.error(message.data.message)
            } else {
              toast.info(message.data.message)
            }
          })
        } catch (error) {
          console.error('Error al conectar WebSocket:', error)
          toast.error('Error al conectar con el servidor')
        }
      }
    }

    initializeWebSocket()

    // Cleanup function
    return () => {
      if (client) {
        client.close()
        setWsClient(null)
      }
    }
  }, [isValid, needsCode, searchParams])

  // Agregar después de los otros useEffect
  useEffect(() => {
    const tmpcode = searchParams.get('tmpcode')
    if (tmpcode && isValid && !needsCode) {
      setShowInviteDrawer(true)
    }
  }, [searchParams, isValid, needsCode])

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return <StoreLoadingSkeleton />
  }

  if (error || !response?.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">
          {error?.message || response?.message || 'Error loading store data'}
        </p>
      </div>
    )
  }

  const store = response.data

  if (isValid && needsCode) {
    return (
      <div className="flex flex-col min-h-screen">
        <StoreHeader store={store} />
        <ValidateCodeDialog
          isValid={isValid}
          needsCode={needsCode}
          onSubmit={(code) => {
            onValidateCode(searchParams.get('qrcode') as string, code)
          }}
        />
      </div>
    )
  }

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <StoreHeader store={store} />
        {isValid && !needsCode && (
          <div className="bg-yellow-200 dark:bg-yellow-700 py-2 px-4 text-center text-sm transition-colors">
            Mesa #{tableId} • Modo pedido
          </div>
        )}
        {!isValid && !needsCode && (
          <div className="bg-yellow-200 dark:bg-yellow-700 py-2 px-4 text-center text-sm transition-colors">
            Mesa no disponible • Modo solo vista
          </div>
        )}
        {store.items && (
          <CategoryTabs
            categories={store.items.filter(
              (c) => c.products && c.products.length > 0
            )}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        )}
        <main className="flex-1 container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {store.items &&
              store.items
                .filter(
                  (category) =>
                    category.products && category.products.length > 0
                )
                .map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    currency={store.currency}
                  />
                ))}
          </motion.div>
        </main>
        {isValid && !needsCode && (
          <>
            <StoreInfoDrawer store={store} />
            <StoreCart />
          </>
        )}
        {isValid && !needsCode && searchParams.get('tmpcode') && (
          <InviteCodeDrawer
            isOpen={showInviteDrawer}
            onClose={() => setShowInviteDrawer(false)}
            tmpCode={searchParams.get('tmpcode') || ''}
          />
        )}
      </div>
    </CartProvider>
  )
}

function StoreLoadingSkeleton() {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <div className="h-[200px] md:h-[300px]">
          <Skeleton className="w-full h-full" />
        </div>
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full" />
            </div>
            <div>
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        </main>
      </div>
    </CartProvider>
  )
}
