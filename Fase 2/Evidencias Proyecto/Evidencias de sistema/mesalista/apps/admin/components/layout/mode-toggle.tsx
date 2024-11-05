'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function ModeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [isRotating, setIsRotating] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted && !theme) {
      setTheme('system')
    }
  }, [mounted, setTheme, theme])

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsRotating(true)
    setTheme(theme === 'light' ? 'dark' : 'light')
    setTimeout(() => setIsRotating(false), 300)
  }

  if (!mounted) {
    return null // or a placeholder
  }

  return (
    <div
      className={cn(
        'flex items-center',
        compact ? 'flex-col space-y-1' : 'space-x-2'
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 w-8 px-0 transition-transform duration-300',
          isRotating && 'rotate-180'
        )}
        onClick={toggleTheme}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      {!compact && mounted && (
        <>
          <span className="text-sm text-muted-foreground">
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs text-muted-foreground">
            By{' '}
            <a
              href="https://bazza-studio.works/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'underline transition-all duration-300',
                theme === 'dark'
                  ? 'text-zinc-400 hover:text-zinc-300'
                  : 'text-zinc-600 hover:zinc-blue-500'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <b className="relative inline-block">
                <span className="absolute -inset-1 bg-gradient-to-r blur opacity-25 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></span>
                <span className="relative">BAZZA</span>
              </b>
            </a>
          </span>
        </>
      )}
    </div>
  )
}
