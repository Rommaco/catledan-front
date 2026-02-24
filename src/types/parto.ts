export interface Parto {
  _id: string
  user?: string
  ganado?: string
  fecha?: string
  tipoParto?: string
  numeroCrias?: number
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePartoData {
  ganado?: string
  fecha?: string
  tipoParto?: string
  numeroCrias?: number
  observaciones?: string
}

export interface UpdatePartoData {
  fecha?: string
  tipoParto?: string
  numeroCrias?: number
  observaciones?: string
}
