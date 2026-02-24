export interface Celo {
  _id: string
  user?: string
  ganado?: string
  fecha?: string
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCeloData {
  ganado?: string
  fecha?: string
  observaciones?: string
}

export interface UpdateCeloData {
  fecha?: string
  observaciones?: string
}
