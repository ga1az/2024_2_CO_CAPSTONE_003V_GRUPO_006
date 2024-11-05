import { Icons } from '@/components/icons'
import { UserRole } from '@/config/sidebar'
import { type SQL } from 'drizzle-orm'

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  withCount?: boolean
}

export interface DataTableFilterField<TData> {
  label: string
  value: keyof TData
  placeholder?: string
  options?: Option[]
}

export interface DataTableFilterOption<TData> {
  id: string
  label: string
  value: keyof TData
  options: Option[]
  filterValues?: string[]
  filterOperator?: string
  isMulti?: boolean
}

export type DrizzleWhere<T> =
  | SQL<unknown>
  | ((aliases: T) => SQL<T> | undefined)
  | undefined

export type NavItem = {
  title: string
  href: string
  badge?: number
  disabled?: boolean
  external?: boolean
  authorizeOnly?: UserRole
  icon?: keyof typeof Icons
}

export type SidebarNavItem = {
  title: string
  items: NavItem[]
  authorizeOnly?: UserRole
  icon?: keyof typeof Icons
}

export type ResultAction =
  | {
      success: true
      data: string
    }
  | {
      success: false
      error: string
    }

export type OrderStatus = {
  label: string
  value: string
}

export const orderStatus: OrderStatus[] = [
  {
    label: 'pendientes',
    value: 'pending'
  },
  {
    label: 'en preparación',
    value: 'in_progress'
  },
  {
    label: 'listos',
    value: 'completed'
  },
  {
    label: 'cancelados',
    value: 'cancelled'
  },
  {
    label: 'entregados',
    value: 'delivered'
  },
  {
    label: 'Todos',
    value: ''
  }
]
