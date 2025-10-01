export interface Finanza {
  _id: string
  fecha: string
  tipo: 'ingreso' | 'gasto'
  categoria: string
  descripcion: string
  monto: number
  estado: 'completado' | 'pendiente' | 'cancelado'
  lote?: string
  cantidad?: number
  unidad?: string
  proveedor?: string
  responsable?: string
  observaciones?: string
  user: string
  createdBy?: {
    _id: string
    email: string
    fullName: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateFinanzaData {
  fecha: string
  tipo: 'ingreso' | 'gasto'
  categoria: string
  descripcion: string
  monto: number
  estado: 'completado' | 'pendiente' | 'cancelado'
  lote?: string
  cantidad?: number
  unidad?: string
  proveedor?: string
  responsable?: string
  observaciones?: string
}

export interface UpdateFinanzaData {
  fecha?: string
  tipo?: 'ingreso' | 'gasto'
  categoria?: string
  descripcion?: string
  monto?: number
  estado?: 'completado' | 'pendiente' | 'cancelado'
  lote?: string
  cantidad?: number
  unidad?: string
  proveedor?: string
  responsable?: string
  observaciones?: string
}

export interface FinanzaFormData {
  fecha: Date
  tipo: 'ingreso' | 'gasto'
  categoria: string
  descripcion: string
  monto: number
  estado: 'completado' | 'pendiente' | 'cancelado'
  lote?: string
  cantidad?: number
  unidad?: string
  proveedor?: string
  responsable?: string
  observaciones?: string
}

export interface FinanzaFilters {
  search?: string
  tipo?: string
  categoria?: string
  estado?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface FinanzaResponse {
  data: Finanza[]
  total: number
  page: number
  pages: number
}

export interface FinanzaStats {
  totalIngresos: number
  totalGastos: number
  balance: number
  transaccionesCompletadas: number
  transaccionesPendientes: number
  transaccionesCanceladas: number
  ingresosPorCategoria: Record<string, number>
  gastosPorCategoria: Record<string, number>
}

export const TIPOS_FINANZA = [
  { value: 'ingreso', label: 'Ingreso', color: 'green' },
  { value: 'gasto', label: 'Gasto', color: 'red' }
] as const

export const ESTADOS_FINANZA = [
  { value: 'completado', label: 'Completado', color: 'green' },
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'cancelado', label: 'Cancelado', color: 'red' }
] as const

export const CATEGORIAS_INGRESOS = [
  'Venta de Ganado',
  'Venta de Leche',
  'Venta de Cultivos',
  'Subsidios',
  'Préstamos',
  'Inversiones',
  'Otros Ingresos'
]

export const CATEGORIAS_GASTOS = [
  'Alimentación',
  'Medicamentos',
  'Veterinario',
  'Mantenimiento',
  'Combustible',
  'Semillas',
  'Fertilizantes',
  'Riego',
  'Mano de Obra',
  'Equipos',
  'Servicios',
  'Otros Gastos'
]

export const UNIDADES = [
  'kg',
  'litros',
  'toneladas',
  'unidades',
  'hectáreas',
  'metros',
  'horas'
]

export const getTipoColor = (tipo: string) => {
  return tipo === 'ingreso' ? 'green' : 'red'
}

export const getTipoLabel = (tipo: string) => {
  return tipo === 'ingreso' ? 'Ingreso' : 'Gasto'
}

export const getEstadoColor = (estado: string) => {
  const estadoConfig = ESTADOS_FINANZA.find(e => e.value === estado)
  return estadoConfig?.color || 'gray'
}

export const getEstadoLabel = (estado: string) => {
  const estadoConfig = ESTADOS_FINANZA.find(e => e.value === estado)
  return estadoConfig?.label || estado
}


