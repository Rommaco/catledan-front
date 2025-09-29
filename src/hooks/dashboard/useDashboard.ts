'use client'
import { useState, useCallback, useEffect } from 'react'
import { dashboardService } from '@/lib/dashboard/dashboardService'
import { 
  DashboardResumen, 
  FinanzaMensual, 
  GanadoPorEstado, 
  ProduccionLeche,
  CultivoDashboard
} from '@/types/dashboard'

export const useDashboardResumen = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardResumen | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await dashboardService.getResumen()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error, data }
}

export const useFinanzasMensuales = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FinanzaMensual[]>([])

  const execute = useCallback(async (year?: number) => {
    try {
      setLoading(true)
      setError(null)
      const result = await dashboardService.getFinanzasMensuales(year)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error, data }
}

export const useGanadoPorEstado = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<GanadoPorEstado[]>([])

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await dashboardService.getGanadoPorEstado()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error, data }
}

export const useProduccionLeche = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProduccionLeche[]>([])

  const execute = useCallback(async (year?: number) => {
    try {
      setLoading(true)
      setError(null)
      const result = await dashboardService.getProduccionLeche(year)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error, data }
}

export const useCultivosDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CultivoDashboard[]>([])

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await dashboardService.getCultivosDashboard()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error, data }
}

// Hook combinado para cargar todos los datos del dashboard
export const useDashboard = () => {
  const [dataLoaded, setDataLoaded] = useState(false)

  const resumen = useDashboardResumen()
  const finanzas = useFinanzasMensuales()
  const ganado = useGanadoPorEstado()
  const produccion = useProduccionLeche()
  const cultivos = useCultivosDashboard()

  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([
        resumen.execute(),
        finanzas.execute(),
        ganado.execute(),
        produccion.execute(),
        cultivos.execute()
      ])
      setDataLoaded(true)
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      setDataLoaded(false)
    }
  }, [])

  useEffect(() => {
    if (!dataLoaded) {
      loadAllData()
    }
  }, [dataLoaded, loadAllData])

  return {
    resumen,
    finanzas,
    ganado,
    produccion,
    cultivos,
    dataLoaded,
    loadAllData
  }
}
