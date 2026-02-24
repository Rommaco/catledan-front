export interface Insumo {
  _id: string
  user?: string
  nombre: string
  tipo: string
  cantidad: number
  unidad: string
  umbralMinimo: number
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateInsumoData {
  nombre: string
  tipo: string
  cantidad: number
  unidad: string
  umbralMinimo: number
  observaciones?: string
}

export interface UpdateInsumoData {
  nombre?: string
  tipo?: string
  cantidad?: number
  unidad?: string
  umbralMinimo?: number
  observaciones?: string
}

export interface InsumoFilters {
  page?: number
  limit?: number
  tipo?: string
}

export interface InsumoListResponse {
  data: Insumo[]
  total: number
  page: number
  limit: number
  totalPages: number
}
