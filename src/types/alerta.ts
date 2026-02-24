export interface Alerta {
  _id: string
  user?: string
  tipo: string
  titulo: string
  mensaje: string
  leido: boolean
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface CreateAlertaData {
  tipo: string
  titulo: string
  mensaje: string
  metadata?: Record<string, unknown>
}

export interface AlertaFilters {
  page?: number
  limit?: number
  leido?: boolean
}

export interface AlertaListResponse {
  data: Alerta[]
  total: number
  page: number
  limit: number
  totalPages: number
}
