export interface Reporte {
  _id: string
  fecha: string
  titulo: string
  descripcion: string
  tipo: 'reproduccion' | 'salud' | 'produccion' | 'financiero' | 'inventario' | 'sanitario' | 'general'
  datos: any
  user: string
  createdBy?: {
    _id: string
    email: string
    fullName: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateReporteData {
  fecha: string
  titulo: string
  descripcion: string
  tipo: 'reproduccion' | 'salud' | 'produccion' | 'financiero' | 'inventario' | 'sanitario' | 'general'
  datos: any
}

export interface UpdateReporteData {
  fecha?: string
  titulo?: string
  descripcion?: string
  tipo?: 'reproduccion' | 'salud' | 'produccion' | 'financiero' | 'inventario' | 'sanitario' | 'general'
  datos?: any
}

export interface ReporteFormData {
  fecha: Date
  titulo: string
  descripcion: string
  tipo: 'reproduccion' | 'salud' | 'produccion' | 'financiero' | 'inventario' | 'sanitario' | 'general'
  datos: any
}

export interface ReporteFilters {
  search?: string
  tipo?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ReporteResponse {
  data: Reporte[]
  total: number
  page: number
  pages: number
}

export interface ReporteStats {
  totalReportes: number
  reportesPorTipo: Record<string, number>
  reportesRecientes: Reporte[]
}

export const TIPOS_REPORTE = [
  { value: 'reproduccion', label: 'Reproducción', color: 'pink' },
  { value: 'salud', label: 'Salud', color: 'red' },
  { value: 'produccion', label: 'Producción', color: 'blue' },
  { value: 'financiero', label: 'Financiero', color: 'green' },
  { value: 'inventario', label: 'Inventario', color: 'purple' },
  { value: 'sanitario', label: 'Sanitario', color: 'yellow' },
  { value: 'general', label: 'General', color: 'gray' }
] as const

export const getTipoColor = (tipo: string) => {
  const tipoConfig = TIPOS_REPORTE.find(t => t.value === tipo)
  return tipoConfig?.color || 'gray'
}

export const getTipoLabel = (tipo: string) => {
  const tipoConfig = TIPOS_REPORTE.find(t => t.value === tipo)
  return tipoConfig?.label || tipo
}
