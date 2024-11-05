'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface InviteCodeDrawerProps {
  isOpen: boolean
  onClose: () => void
  tmpCode: string
}

export function InviteCodeDrawer({
  isOpen,
  onClose,
  tmpCode
}: InviteCodeDrawerProps) {
  const inviteLink = typeof window !== 'undefined' ? window.location.href : ''

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a mi mesa',
          text: 'Únete a mi mesa usando este enlace',
          url: inviteLink
        })
      } catch (err) {
        copyToClipboard(inviteLink)
      }
    } else {
      copyToClipboard(inviteLink)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="min-h-96">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-bold text-center">
            Invita a tus acompañantes
          </DrawerTitle>
          <DrawerDescription className="text-center">
            Comparte este código o enlace para que otros puedan unirse a tu mesa
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Código de invitación</label>
            <div className="flex gap-2">
              <Input
                value={tmpCode}
                readOnly
                className={cn(
                  'text-center text-lg font-mono tracking-wider',
                  'bg-muted/50 border-2 focus-visible:ring-2',
                  'placeholder:text-muted-foreground'
                )}
              />
              <Button
                size="icon"
                variant="outline"
                className="hover:bg-muted/80 transition-colors"
                onClick={() => copyToClipboard(tmpCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">Enlace de invitación</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(inviteLink)}
              >
                Copiar enlace de invitación
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="hover:bg-muted/80 transition-colors"
                onClick={shareLink}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
