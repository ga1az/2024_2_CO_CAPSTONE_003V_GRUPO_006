'use client'

import { createContext, useContext } from 'react'

interface StoreContextType {
  store: {
    name: string
    slug: string
    bgImage?: string | null
  } | null
}

const StoreContext = createContext<StoreContextType>({ store: null })

export function useStore() {
  return useContext(StoreContext)
}

export function StoreProvider({
  children,
  store
}: {
  children: React.ReactNode
  store: StoreContextType['store']
}) {
  return (
    <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
  )
}
