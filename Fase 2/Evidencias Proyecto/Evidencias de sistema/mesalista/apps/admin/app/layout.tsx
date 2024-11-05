import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './styles/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ViewTransitions } from 'next-view-transitions'
import { QueryProvider } from '@/components/providers/query-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const metadata: Metadata = {
  title: 'MesaLista Admin',
  description: 'Admin panel for MesaLista'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <QueryProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
            <Toaster closeButton richColors />
          </body>
        </html>
      </QueryProvider>
    </ViewTransitions>
  )
}
