export interface ProduccionLeche {
  _id: string;
  user: string;
  fecha: string;
  cantidad: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProduccionLecheData {
  fecha: string;
  cantidad: number;
  observaciones?: string;
}

export interface UpdateProduccionLecheData {
  fecha?: string;
  cantidad?: number;
  observaciones?: string;
}

export interface ProduccionLecheFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ProduccionLecheResponse {
  data: ProduccionLeche[];
  total: number;
}

export interface ProduccionLecheFormData {
  fecha: Date;
  cantidad: number;
  observaciones?: string;
}
