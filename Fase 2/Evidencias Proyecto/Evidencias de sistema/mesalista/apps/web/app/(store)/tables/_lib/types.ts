export interface Table {
  id: number
  identifier: string
  idStore: number
  capacity: number
  isActive: boolean
  isDeleted: boolean
  deviceId: string | null
  qrCode: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface TableResponse {
  status: number
  message: string
  data: Table[] | null
  error?: string
}
