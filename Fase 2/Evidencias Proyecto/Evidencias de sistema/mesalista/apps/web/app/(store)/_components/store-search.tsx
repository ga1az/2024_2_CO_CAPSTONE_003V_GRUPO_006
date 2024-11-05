'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { StoreGrid } from './store-grid'
import { getAllStores } from '../_lib/actions'
import { Search, X, Store as StoreIcon } from 'lucide-react'

export function StoreSearch() {
  const [search, setSearch] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const { data: storesResponse, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: getAllStores
  })

  const stores = storesResponse?.data || []

  const filteredStores = stores.filter(
    (store) =>
      store.isActive && // Only show active stores
      (store.name.toLowerCase().includes(search.toLowerCase()) ||
        (store.desc?.toLowerCase() || '').includes(search.toLowerCase()))
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearch('')
        setIsFocused(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12 max-w-4xl mx-auto px-4 py-8"
    >
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
        >
          <StoreIcon className="w-10 h-10 text-primary" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
            Welcome to MesaLista
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and explore local restaurants, cafes, and eateries. Your
            next great dining experience is just a click away.
          </p>
        </motion.div>
      </div>

      {/* Search Section */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="relative max-w-2xl mx-auto">
          <motion.div
            className={`absolute inset-0 rounded-lg ${
              isFocused ? 'bg-primary/5' : 'bg-transparent'
            }`}
            layoutId="searchBackground"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search active stores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full pl-10 pr-10 h-12 text-base bg-transparent border-2 border-primary/10 focus:border-primary/20 rounded-lg transition-all duration-300"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-3xl font-bold text-primary">
              {stores.filter((s) => s.isActive).length}
            </p>
            <p className="text-sm text-muted-foreground">Active Stores</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-3xl font-bold text-primary">
              {filteredStores.length}
            </p>
            <p className="text-sm text-muted-foreground">Search Results</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Store Grid */}
      <StoreGrid stores={filteredStores} isLoading={isLoading} />
    </motion.div>
  )
}
