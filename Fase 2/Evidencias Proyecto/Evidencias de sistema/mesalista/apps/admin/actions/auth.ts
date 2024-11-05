'use server'

import { LoginFormValue } from '@/types/auth'
import { deleteSession } from '@/actions/session'
import { ResultAction } from '@/types'
import { cookies } from 'next/headers'
import { api } from '@mesalista/api'

export async function login(formData: LoginFormValue): Promise<ResultAction> {
  try {
    const jwtAccess = await api.public.auth.signin.post({
      email: formData.email,
      password: formData.password
    })

    if (!jwtAccess.data?.data.accessToken) {
      return {
        success: false,
        error: 'El usuario no existe'
      }
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    cookies().set('session', jwtAccess.data.data.accessToken, {
      httpOnly: true,
      secure: false, //poner en true en producción
      expires: expiresAt,
      sameSite: 'lax',
      path: '/'
    })

    return {
      success: true,
      data: 'Sesión iniciada correctamente'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error al iniciar sesión'
    }
  }
}

export async function logout() {
  deleteSession()
}

export async function getCookie() {
  const cookie = cookies().get('session')?.value

  if (!cookie) {
    return null
  }
  return `Bearer ${cookie}`
}
