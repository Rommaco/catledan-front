export interface Parcela {
  _id: string
  user?: string
  nombre: string
  direccion?: string
  region: string
  estado: string
  municipio: string
  areaHectareas: number
  latitud?: number
  longitud?: number
  observaciones?: string
  createdAt: string
  updatedAt: string
}

export interface CreateParcelaData {
  nombre: string
  direccion?: string
  region: string
  estado: string
  municipio: string
  areaHectareas: number
  latitud?: number
  longitud?: number
  observaciones?: string
}

export interface UpdateParcelaData {
  nombre?: string
  direccion?: string
  region?: string
  estado?: string
  municipio?: string
  areaHectareas?: number
  latitud?: number
  longitud?: number
  observaciones?: string
}

export interface ParcelaFilters {
  page?: number
  limit?: number
  region?: string
  estado?: string
  municipio?: string
}

export interface ParcelaListResponse {
  data: Parcela[]
  total: number
  page: number
  limit: number
  totalPages: number
}
