export interface Vacuna {
  _id: string
  ganado?: string
  fecha?: string
  tipo?: string
  lote?: string
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface Tratamiento {
  _id: string
  ganado?: string
  fecha?: string
  tipo?: string
  producto?: string
  dosis?: string
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}
