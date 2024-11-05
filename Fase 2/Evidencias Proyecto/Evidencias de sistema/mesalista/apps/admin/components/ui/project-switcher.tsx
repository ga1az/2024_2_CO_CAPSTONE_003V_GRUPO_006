'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useStore } from '@/contexts/store-context'

type ProjectType = {
  title: string
  slug: string
  color: string
}

const projects: ProjectType[] = [
  {
    title: 'Restaurant Lomas',
    slug: 'restaurant-lomas',
    color: 'bg-red-500'
  }
]
const selected: ProjectType = projects[0]

export default function ProjectSwitcher({
  large = false
}: {
  large?: boolean
}) {
  const [openPopover, setOpenPopover] = useState(false)
  const { store } = useStore()

  if (!store) {
    return <ProjectSwitcherPlaceholder />
  }

  return (
    <div>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button
            className="h-8 px-2"
            variant={openPopover ? 'secondary' : 'ghost'}
            onClick={() => setOpenPopover(!openPopover)}
          >
            <div className="flex items-center space-x-3 pr-2">
              {store.bgImage ? (
                <img
                  src={store.bgImage}
                  alt={store.name}
                  className="size-3 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="size-3 shrink-0 rounded-full bg-primary" />
              )}
              <div className="flex items-center space-x-3">
                <span
                  className={cn(
                    'inline-block truncate text-sm font-medium xl:max-w-[120px]',
                    large ? 'w-full' : 'max-w-[80px]'
                  )}
                >
                  {store.name}
                </span>
              </div>
            </div>
            <ChevronsUpDown
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-w-60 p-2">
          <div className="flex flex-col gap-1">
            <Link
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'relative flex h-9 items-center gap-3 p-3 text-muted-foreground hover:text-foreground'
              )}
              href="#"
            >
              {store.bgImage ? (
                <img
                  src={store.bgImage}
                  alt={store.name}
                  className="size-3 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="size-3 shrink-0 rounded-full bg-primary" />
              )}
              <span className="flex-1 truncate text-sm font-medium">
                {store.name}
              </span>
              <Check size={18} aria-hidden="true" className="text-foreground" />
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ProjectList({
  selected,
  projects,
  setOpenPopover
}: {
  selected: ProjectType
  projects: ProjectType[]
  setOpenPopover: (open: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      {projects.map(({ slug, color }) => (
        <Link
          key={slug}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'relative flex h-9 items-center gap-3 p-3 text-muted-foreground hover:text-foreground'
          )}
          href="#"
          onClick={() => setOpenPopover(false)}
        >
          <div className={cn('size-3 shrink-0 rounded-full', color)} />
          <span
            className={`flex-1 truncate text-sm ${
              selected.slug === slug
                ? 'font-medium text-foreground'
                : 'font-normal'
            }`}
          >
            {slug}
          </span>
          {selected.slug === slug && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground">
              <Check size={18} aria-hidden="true" />
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}

function ProjectSwitcherPlaceholder() {
  return (
    <div className="flex animate-pulse items-center space-x-1.5 rounded-lg px-1.5 py-2 sm:w-60">
      <div className="h-8 w-36 animate-pulse rounded-md bg-muted xl:w-[180px]" />
    </div>
  )
}
