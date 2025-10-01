export interface Subuser {
  _id: string
  fullName: string
  email: string
  permisos: string[]
  isOnline?: boolean
  lastSeen?: string
  currentTempPassword?: string
  tempPasswordExpires?: string
  createdAt: string
  lastPasswordUpdate?: string
  isPasswordExpired?: boolean
}

export interface CreateSubuserData {
  fullName: string
  email: string
  rol: 'administrativo' | 'trabajador'
}

export interface UpdateSubuserData {
  fullName?: string
  email?: string
  permisos?: string[]
}

export interface SubuserFilters {
  search?: string
  rol?: 'administrativo' | 'trabajador'
  isOnline?: boolean
  page?: number
  limit?: number
}

export interface SubuserResponse {
  data: Subuser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SubuserStats {
  totalSubusers: number
  onlineSubusers: number
  offlineSubusers: number
  administrativos: number
  trabajadores: number
}

export interface RefreshPasswordsResponse {
  message: string
  updatedCount: number
  passwords: string[]
}

export const ROLES_SUBUSER = [
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'trabajador', label: 'Trabajador' },
] as const

export const PERMISOS_SUBUSER = [
  { value: 'read', label: 'Lectura' },
  { value: 'write', label: 'Escritura' },
  { value: 'delete', label: 'Eliminación' },
  { value: 'export', label: 'Exportación' },
] as const

export const getRolColor = (rol: string) => {
  switch (rol) {
    case 'administrativo':
      return 'blue'
    case 'trabajador':
      return 'green'
    default:
      return 'gray'
  }
}

export const getPermisoColor = (permiso: string) => {
  switch (permiso) {
    case 'read':
      return 'blue'
    case 'write':
      return 'green'
    case 'delete':
      return 'red'
    case 'export':
      return 'purple'
    default:
      return 'gray'
  }
}

export const getStatusColor = (isOnline: boolean) => {
  return isOnline ? 'success' : 'default'
}

export const getStatusText = (isOnline: boolean, lastSeen?: string) => {
  if (isOnline) return 'En línea'
  if (lastSeen) {
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`
  }
  return 'Desconocido'
}
