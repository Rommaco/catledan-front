export interface ConfiguracionEmpresa {
  nombre: string
  rfc: string
  direccion: string
  telefono: string
  email: string
  sitioWeb?: string
  descripcion?: string
}

export interface ConfiguracionUsuario {
  nombre: string
  email: string
  telefono?: string
  rol: string
  avatar?: string
}

export interface ConfiguracionSistema {
  idioma: string
  zonaHoraria: string
  formatoFecha: string
  moneda: string
  notificaciones: {
    email: boolean
    push: boolean
    recordatoriosVacunacion: boolean
    alertasPeso: boolean
    reportesAutomaticos: boolean
  }
}

export interface Configuracion {
  _id: string
  empresa: ConfiguracionEmpresa
  usuario: ConfiguracionUsuario
  sistema: ConfiguracionSistema
  user: string
  createdAt: string
  updatedAt: string
}

export interface UpdateConfiguracionData {
  empresa?: Partial<ConfiguracionEmpresa>
  usuario?: Partial<ConfiguracionUsuario>
  sistema?: Partial<ConfiguracionSistema>
}

export const IDIOMAS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' }
] as const

export const ZONAS_HORARIAS = [
  { value: 'America/Mexico_City', label: 'México (GMT-6)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' }
] as const

export const FORMATOS_FECHA = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
] as const

export const MONEDAS = [
  { value: 'MXN', label: 'Peso Mexicano (MXN)' },
  { value: 'USD', label: 'Dólar Americano (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'CAD', label: 'Dólar Canadiense (CAD)' }
] as const

export const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'trabajador', label: 'Trabajador' },
  { value: 'veterinario', label: 'Veterinario' }
] as const

export const getConfiguracionDefault = (): Configuracion => ({
  _id: '',
  empresa: {
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    email: '',
    sitioWeb: '',
    descripcion: ''
  },
  usuario: {
    nombre: '',
    email: '',
    telefono: '',
    rol: 'admin',
    avatar: ''
  },
  sistema: {
    idioma: 'es',
    zonaHoraria: 'America/Mexico_City',
    formatoFecha: 'DD/MM/YYYY',
    moneda: 'MXN',
    notificaciones: {
      email: true,
      push: true,
      recordatoriosVacunacion: true,
      alertasPeso: true,
      reportesAutomaticos: false
    }
  },
  user: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})


