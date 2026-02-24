export interface Venta {
  _id: string
  user?: string
  fecha: string
  tipo: string
  concepto: string
  cantidad: number
  monto: number
  comprador?: string
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateVentaData {
  fecha: string
  tipo: string
  concepto: string
  cantidad: number
  monto: number
  comprador?: string
  observaciones?: string
}

export interface UpdateVentaData {
  fecha?: string
  tipo?: string
  concepto?: string
  cantidad?: number
  monto?: number
  comprador?: string
  observaciones?: string
}

export interface VentaFilters {
  page?: number
  limit?: number
  tipo?: string
}

export interface VentaListResponse {
  data: Venta[]
  total: number
  page: number
  limit: number
  totalPages: number
}
