import { Metadata } from 'next'
import UserAuthForm from '@/components/forms/user-auth-form'
import { Icons } from '@/components/icons'
import Image from 'next/image'
import bgLoginImage from '@/public/img/bgLogin.jpg'

export const metadata: Metadata = {
  title: 'Iniciar sesión | MesaLista',
  description: 'Accede a tu cuenta de MesaLista para gestionar tu negocio.'
}

export default function AuthenticationPage() {
  return (
    <div className="flex relative h-screen w-full overflow-hidden bg-zinc-400 dark:bg-zinc-950">
      {/* Background Image */}
      <Image
        src={bgLoginImage}
        fill={true}
        alt="Restaurant background"
        style={{ objectFit: 'cover' }}
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 flex w-full">
        {/* Left side - Branding and Quote */}
        <div className="hidden w-3/5 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center space-x-3">
            <Icons.products className="h-10 w-10" />
            <span className="text-3xl font-light">MesaLista</span>
          </div>
          <blockquote className="space-y-2">
            <p className="text-5xl font-light leading-tight">
              Invierte en la experiencia de tus clientes y en la eficiencia de
              tu negocio.
            </p>
            <footer className="text-lg">- Equipo MesaLista</footer>
          </blockquote>
        </div>

        {/* Right side - Login Form */}
        <div className="flex w-full items-center justify-center backdrop-blur-xl bg-zinc-400/80 dark:bg-black/80 lg:w-2/5">
          <div className="w-full max-w-md space-y-8 px-4 sm:px-6 lg:px-8 dark:text-zinc-200 text-zinc-800">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold">
                Bienvenido
              </h2>
              <p className="mt-2 text-center text-sm">
                Inicia sesión en tu cuenta para continuar
              </p>
            </div>
            <UserAuthForm />
          </div>
        </div>
      </div>
    </div>
  )
}
