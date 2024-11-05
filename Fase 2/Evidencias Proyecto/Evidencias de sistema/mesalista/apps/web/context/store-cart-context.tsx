import { createContext, useContext, useReducer } from 'react'
import { Product } from '@/app/(store)/store/_lib/schemas'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  modifiers: Record<number, number[]>
  addedBy: {
    id: string
    name: string
    color: string
  }
}

export interface CartState {
  items: CartItem[]
  users: {
    id: string
    name: string
    color: string
  }[]
  currentUser?: {
    id: string
    name: string
    color: string
  }
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'ADD_USER'; payload: { id: string; name: string; color: string } }
  | {
      type: 'SET_CURRENT_USER'
      payload: { id: string; name: string; color: string }
    }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload)
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      }
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload
      }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    users: [],
    currentUser: undefined
  })

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
