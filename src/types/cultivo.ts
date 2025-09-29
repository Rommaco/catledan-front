export interface Cultivo {
  _id: string;
  nombre: string;
  tipo: string;
  area: number;
  fechaSiembra: string;
  fechaCosecha?: string;
  variedad?: string;
  densidadSiembra?: number;
  fertilizacion?: Fertilizacion[];
  riego?: Riego;
  plagas?: Plaga[];
  rendimientoEsperado?: number;
  rendimientoReal?: number;
  estado: 'sembrado' | 'en crecimiento' | 'maduro' | 'cosechado';
  observaciones?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fertilizacion {
  tipo: 'orgánico' | 'químico' | 'mixto';
  fecha: string;
  cantidad: number;
  producto: string;
}

export interface Riego {
  tipo: 'goteo' | 'aspersión' | 'gravedad' | 'pivote';
  frecuencia: string;
  duracion: number;
}

export interface Plaga {
  nombre: string;
  fecha: string;
  severidad: 'baja' | 'media' | 'alta';
  tratamiento: string;
  estado: 'activa' | 'controlada' | 'erradicada';
}

export interface CreateCultivoData {
  nombre: string;
  tipo: string;
  area: number;
  fechaSiembra: string;
  fechaCosecha?: string;
  variedad?: string;
  densidadSiembra?: number;
  fertilizacion?: Fertilizacion[];
  riego?: Riego;
  plagas?: Plaga[];
  rendimientoEsperado?: number;
  rendimientoReal?: number;
  estado: 'sembrado' | 'en crecimiento' | 'maduro' | 'cosechado';
  observaciones?: string;
}

export interface UpdateCultivoData {
  nombre?: string;
  tipo?: string;
  area?: number;
  fechaSiembra?: string;
  fechaCosecha?: string;
  variedad?: string;
  densidadSiembra?: number;
  fertilizacion?: Fertilizacion[];
  riego?: Riego;
  plagas?: Plaga[];
  rendimientoEsperado?: number;
  rendimientoReal?: number;
  estado?: 'sembrado' | 'en crecimiento' | 'maduro' | 'cosechado';
  observaciones?: string;
}

export interface CultivoFormData {
  nombre: string;
  tipo: string;
  area: number;
  fechaSiembra: Date;
  fechaCosecha?: Date | null;
  variedad?: string;
  densidadSiembra?: number;
  rendimientoEsperado?: number;
  rendimientoReal?: number;
  estado: 'sembrado' | 'en crecimiento' | 'maduro' | 'cosechado';
  observaciones?: string;
}

export interface CultivoFilters {
  search?: string;
  tipo?: string;
  estado?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CultivoResponse {
  data: Cultivo[];
  total: number;
}
