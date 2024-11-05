import { z } from 'zod'

export const LoginFormSchema = z.object({
  email: z
    .string({ required_error: 'El correo es obligatorio' })
    .min(1, 'El correo es obligatorio')
    .email('Correo invalido'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria')
})

export type LoginFormValue = z.infer<typeof LoginFormSchema>

export type SessionPayload = {
  userId: number
  email: string
  store: number
  name: string
  image?: string
  role: string
  expiresAt?: Date
}
