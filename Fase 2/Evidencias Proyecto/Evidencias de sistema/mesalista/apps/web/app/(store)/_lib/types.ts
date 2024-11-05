export interface Store {
  id: number
  name: string
  slug: string
  desc: string | null
  bgImage: string | null
  isActive: boolean
}

export interface StoresResponse {
  status: number
  message: string
  data: Store[]
}
