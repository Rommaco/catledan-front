'use client'
import { useState, useCallback, useEffect } from 'react'
import { subuserService } from '@/lib/subuser/subuserService'
import {
  Subuser,
  CreateSubuserData,
  UpdateSubuserData,
  SubuserFilters,
  SubuserStats,
  RefreshPasswordsResponse,
} from '@/types/subuser'
import { useToast } from '../useToast'

export const useSubuser = () => {
  const [data, setData] = useState<Subuser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()

  const fetchSubusers = useCallback(
    async (filters?: SubuserFilters) => {
      try {
        setLoading(true)
        setError(null)

        const response = await subuserService.getAll({
          ...filters,
          page: currentPage,
          limit: pageSize,
        })

        setData(response)
        setTotal(response.length)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar los subusuarios.',
        })
      } finally {
        setLoading(false)
      }
    },
    [currentPage, pageSize, toast],
  )

  const addSubuser = useCallback(
    async (newData: CreateSubuserData) => {
      try {
        setLoading(true)
        const createdRecord = await subuserService.create(newData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Subusuario creado correctamente.',
        })
        fetchSubusers() // Refresh data after adding
        return createdRecord
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al crear el subusuario.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchSubusers],
  )

  const updateSubuser = useCallback(
    async (id: string, updatedData: UpdateSubuserData) => {
      try {
        setLoading(true)
        const newUpdatedRecord = await subuserService.update(id, updatedData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Subusuario actualizado correctamente.',
        })
        fetchSubusers() // Refresh data after updating
        return newUpdatedRecord
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar el subusuario.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchSubusers],
  )

  const deleteSubuser = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        await subuserService.delete(id)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Subusuario eliminado correctamente.',
        })
        fetchSubusers() // Refresh data after deleting
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al eliminar el subusuario.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchSubusers],
  )

  const refreshPasswords = useCallback(async () => {
    try {
      setLoading(true)
      const response = await subuserService.refreshPasswords()
      toast({
        type: 'success',
        title: 'Éxito',
        message: `Se actualizaron ${response.updatedCount} contraseñas.`,
      })
      fetchSubusers() // Refresh data after refreshing passwords
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar las contraseñas.',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast, fetchSubusers])

  return {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchSubusers,
    addSubuser,
    updateSubuser,
    deleteSubuser,
    refreshPasswords,
  }
}

export const useSubuserStats = (filters?: SubuserFilters) => {
  const [stats, setStats] = useState<SubuserStats>({
    totalSubusers: 0,
    onlineSubusers: 0,
    offlineSubusers: 0,
    administrativos: 0,
    trabajadores: 0,
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const { toast } = useToast()

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const fetchedStats = await subuserService.getStats()
      setStats(fetchedStats)
    } catch (err) {
      console.error('Error al cargar estadísticas de subusuarios:', err)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar las estadísticas de subusuarios.',
      })
      setStats({
        totalSubusers: 0,
        onlineSubusers: 0,
        offlineSubusers: 0,
        administrativos: 0,
        trabajadores: 0,
      })
    } finally {
      setLoadingStats(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, filters])

  return { stats, loadingStats, fetchStats }
}
