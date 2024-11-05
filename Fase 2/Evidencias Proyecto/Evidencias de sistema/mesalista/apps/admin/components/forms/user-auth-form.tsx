'use client'

import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LoginFormSchema } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icons } from '@/components/icons'

type UserFormValue = z.infer<typeof LoginFormSchema>

export default function UserAuthForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<UserFormValue>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: UserFormValue) => {
    try {
      setLoading(true)
      const result = await login(data)
      if (!result.success) {
        toast.error(result.error)
      } else {
        router.replace('/')
        toast.success(result.data)
      }
    } catch (error: any) {
      toast.error('Ocurrió un error al iniciar sesión')
    } finally {
      form.reset()
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        method="POST"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu@ejemplo.com"
                  autoComplete="email"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button disabled={loading} className="w-full" type="submit">
          {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Iniciar sesión
        </Button>
      </form>
    </Form>
  )
}
