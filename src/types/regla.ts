export interface CondicionRegla {
  tipo?: string
  campo?: string
  operador?: string
  valor?: number | string
  [k: string]: unknown
}

export interface AccionRegla {
  tipo?: string
  mensaje?: string
  crearAlerta?: boolean
  notificarEmail?: boolean
  [k: string]: unknown
}

export interface Regla {
  _id: string
  user?: string
  nombre: string
  condicion: CondicionRegla
  accion: AccionRegla
  activa: boolean
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateReglaData {
  nombre: string
  condicion: CondicionRegla
  accion: AccionRegla
  activa: boolean
  observaciones?: string
}

export interface UpdateReglaData {
  nombre?: string
  condicion?: CondicionRegla
  accion?: AccionRegla
  activa?: boolean
  observaciones?: string
}

export interface ReglaFilters {
  page?: number
  limit?: number
}

export interface ReglaListResponse {
  data: Regla[]
  total: number
  page: number
  limit: number
  totalPages: number
}
