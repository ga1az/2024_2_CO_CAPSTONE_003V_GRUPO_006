import { faker } from '@faker-js/faker/locale/es_MX'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  name: string
  color: string
  isInitialized: boolean // nuevo flag para controlar la inicialización
  onChange: (name: string, color: string) => void
  initialize: () => void // nueva función para inicializar
}

const useUser = create<User>()(
  persist(
    (set) => ({
      name: '',
      color: '',
      isInitialized: false,
      onChange: (name: string, color: string) => {
        set({ name, color })
      },
      initialize: () => {
        set((state) => {
          if (!state.isInitialized) {
            return {
              name: faker.animal.type(),
              color: faker.color.rgb(),
              isInitialized: true
            }
          }
          return state
        })
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        name: state.name,
        color: state.color,
        isInitialized: state.isInitialized
      })
    }
  )
)

export default useUser
