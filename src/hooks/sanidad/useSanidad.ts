'use client'
import { useState, useCallback } from 'react'
import { sanidadService } from '@/lib/sanidad/sanidadService'
import type { Vacuna, Tratamiento } from '@/types/sanidad'

export const useSanidad = () => {
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [totalVacunas, setTotalVacunas] = useState(0)
  const [totalTratamientos, setTotalTratamientos] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageVacunas, setPageVacunas] = useState(1)
  const [pageTratamientos, setPageTratamientos] = useState(1)
  const [pageSize] = useState(10)

  const fetchVacunas = useCallback(async (filters?: { page?: number }) => {
    try {
      setLoading(true)
      setError(null)
      const res = await sanidadService.getVacunaciones({ page: filters?.page ?? pageVacunas, limit: pageSize })
      setVacunas(res.data)
      setTotalVacunas(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [pageVacunas, pageSize])

  const fetchTratamientos = useCallback(async (filters?: { page?: number }) => {
    try {
      setLoading(true)
      setError(null)
      const res = await sanidadService.getTratamientos({ page: filters?.page ?? pageTratamientos, limit: pageSize })
      setTratamientos(res.data)
      setTotalTratamientos(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [pageTratamientos, pageSize])

  return {
    vacunas,
    tratamientos,
    totalVacunas,
    totalTratamientos,
    loading,
    error,
    pageVacunas,
    pageTratamientos,
    setPageVacunas,
    setPageTratamientos,
    fetchVacunas,
    fetchTratamientos,
    updateVacuna: sanidadService.updateVacuna.bind(sanidadService),
    deleteVacuna: sanidadService.deleteVacuna.bind(sanidadService),
    updateTratamiento: sanidadService.updateTratamiento.bind(sanidadService),
    deleteTratamiento: sanidadService.deleteTratamiento.bind(sanidadService),
  }
}
