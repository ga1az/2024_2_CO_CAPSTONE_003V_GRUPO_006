import { SidebarNavItem } from '@/types'

export const enum UserRole {
  ADMIN = 'ADMIN',
  KITCHEN = 'KITCHEN',
  WAITER = 'WAITER'
}

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: 'PLATAFORMA',
    items: [
      {
        href: '/',
        icon: 'dashboard',
        title: 'Métricas'
      }
    ]
  },
  {
    title: 'ORGANIZACIÓN',
    items: [
      {
        href: '/branch',
        icon: 'store',
        title: 'Sucursal',
        authorizeOnly: UserRole.ADMIN
      },
      {
        href: '/employee',
        icon: 'employee',
        title: 'Personal',
        disabled: true,
        authorizeOnly: UserRole.ADMIN
      }
      // {
      //   href: '/admin/prices',
      //   icon: 'price',
      //   title: 'Precios y Tarifas',
      //   disabled: true
      // }
    ]
  },
  {
    title: 'MODULOS',
    items: [
      {
        href: '/categories',
        icon: 'category',
        title: 'Categorías'
      },
      {
        href: '/products',
        icon: 'products',
        title: 'Productos'
      },
      {
        href: '/modifiers',
        icon: 'modifiers',
        title: 'Modificadores'
      }
    ]
  },
  {
    title: 'SERVICIOS',
    items: [
      {
        href: '/kitchen',
        icon: 'kitchen',
        title: 'Cocina',
        authorizeOnly: UserRole.ADMIN || UserRole.KITCHEN
      },
      {
        href: '/waiter',
        icon: 'waiter',
        title: 'Mesero',
        authorizeOnly: UserRole.ADMIN || UserRole.WAITER
      },
      {
        href: '/table',
        icon: 'table',
        title: 'Mesas',
        authorizeOnly: UserRole.ADMIN || UserRole.WAITER
      }
    ]
  }
]
