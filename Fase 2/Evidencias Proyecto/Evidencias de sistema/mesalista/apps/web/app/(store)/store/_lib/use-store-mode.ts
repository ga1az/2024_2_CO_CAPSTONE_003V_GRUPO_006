'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export type StoreMode = 'view' | 'order'

export function useStoreMode() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<StoreMode>('view')

  useEffect(() => {
    // Aquí posteriormente validaremos el QR
    const tableQR = searchParams.get('table')
    if (tableQR) {
      // Temporalmente, cualquier parámetro table activará el modo order
      setMode('order')
    }
  }, [searchParams])

  return {
    mode,
    isOrderMode: mode === 'order',
    isViewMode: mode === 'view'
  }
}
