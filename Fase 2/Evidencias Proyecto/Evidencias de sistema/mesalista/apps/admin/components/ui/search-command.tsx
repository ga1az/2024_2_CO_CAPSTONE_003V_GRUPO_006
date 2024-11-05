'use client'

import React from 'react'
import { SidebarNavItem } from '@/types'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { DialogDescription, DialogTitle } from './dialog'
import { Kbd } from '../kbd'
import { useTransitionRouter } from 'next-view-transitions'

export function SearchCommand({ links }: { links: SidebarNavItem[] }) {
  const [open, setOpen] = React.useState(false)
  const router = useTransitionRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-72'
        )}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex">
          Buscar
          <span className="hidden sm:inline-flex">&nbsp;</span>...
        </span>
        <Kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </Kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        {/* This is required for an error when dont use DialogTitle and description */}
        <VisuallyHidden>
          <DialogTitle>Buscar en la aplicación</DialogTitle>
          <DialogDescription>
            Utiliza las teclas de flecha para navegar y Enter para seleccionar.
          </DialogDescription>
        </VisuallyHidden>
        <CommandInput placeholder="Buscar en la aplicación" />
        <CommandList>
          <CommandEmpty>
            No se encontraron resultados para la búsqueda.
          </CommandEmpty>
          {links.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => {
                const Icon = Icons[item.icon || 'arrowRight']
                return (
                  <CommandItem
                    key={item.title}
                    disabled={item.disabled}
                    onSelect={() => {
                      runCommand(() => router.push(item.href as string))
                    }}
                  >
                    <Icon className="mr-2 size-5" />
                    {item.title}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
