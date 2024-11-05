'use client'

import { useEffect, useState } from 'react'
import { QRCode } from '@/components/qr-code'
import { motion } from 'framer-motion'
import { Table } from '../_lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Share2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from 'next-themes'

interface TableQRProps {
  table: Table
  storeName: string
}

export function TableQR({ table, storeName }: TableQRProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Manejar el montaje del componente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Obtener el tema actual
  const currentTheme = mounted
    ? theme === 'system'
      ? systemTheme
      : theme
    : 'light'
  const qrUrl = `http://localhost:4000/public/session/id/${table.qrCode}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storeName} - Mesa ${table.identifier}`,
          text: 'Escanea este código QR para realizar tu pedido',
          url: qrUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      toast({
        title: 'Enlace copiado',
        description: 'El enlace ha sido copiado al portapapeles.'
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-[90vw] md:max-w-[500px] px-4 flex flex-col items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-4xl font-bold mb-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
          >
            {storeName}
          </motion.h1>
          <motion.div
            className="flex items-center justify-center gap-2 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span>Mesa {table.identifier}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>1</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="p-8 border-none bg-transparent rounded-xl overflow-hidden relative shadow-lg">
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <div className="aspect-square w-full flex items-center justify-center relative z-10">
              <QRCode url={qrUrl} scale={2} fgColor="#000000" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-8 space-y-4 text-center"
        >
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <span>Capacidad:</span>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{table.capacity} personas</span>
            </div>
          </motion.div>
          <div className="flex items-center justify-center gap-5 mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <Button
                onClick={handleShare}
                className="bg-primary hover:bg-primary/90"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Share2 className="mr-2 h-4 w-4" />
                )}
                {copied ? 'Copiado' : 'Compartir enlace'}
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <a
                href={qrUrl}
                className="inline-flex gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-green-500 text-primary-foreground shadow hover:bg-green-400/90 h-9 px-4 py-2"
              >
                Pedir desde aquí
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
