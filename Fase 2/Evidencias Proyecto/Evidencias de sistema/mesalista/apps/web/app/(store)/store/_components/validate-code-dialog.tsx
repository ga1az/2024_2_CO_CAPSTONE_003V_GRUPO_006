'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ValidateCodeDialogProps {
  isValid: boolean
  needsCode: boolean
  onSubmit: (code: string) => void
}

export function ValidateCodeDialog({
  isValid,
  needsCode,
  onSubmit
}: ValidateCodeDialogProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (code.length === 6) {
      handleSubmit(code)
    }
  }, [code])

  const handleSubmit = (submittedCode: string) => {
    if (submittedCode.length !== 6) {
      setError('El código debe tener 6 dígitos')
      return
    }

    setError('')
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('tmpcode', submittedCode)

    onSubmit(submittedCode)
    router.replace(currentUrl.pathname + currentUrl.search)
  }

  return (
    <Dialog open={isValid && needsCode} modal={true}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-none tracking-tight">
            Código de acceso
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Ingresa el código de 6 dígitos para continuar
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-8 py-4">
          <div className="flex justify-center">
            <InputOTP
              value={code}
              onChange={(value) => {
                setError('')
                setCode(value)
              }}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center space-y-1 text-sm text-muted-foreground">
            <p>
              Pidele el código al dueño de la mesa (el primero usuario en
              escanear el QR)
            </p>
            <p>o puedes solicitarlo al personal del local</p>
          </div>

          {code.length === 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <Button
                className="w-full gap-2"
                onClick={() => handleSubmit(code)}
              >
                <Check className="h-4 w-4" />
                Validar código
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
