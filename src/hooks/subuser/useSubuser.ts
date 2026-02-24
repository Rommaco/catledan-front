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

        const list = Array.isArray(response) ? response : []
        setData(list)
        setTotal(list.length)
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
        const result = await subuserService.create(newData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Subusuario creado correctamente.',
        })
        fetchSubusers()
        return result
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
      fetchSubusers()
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

  const resetPassword = useCallback(
    async (id: string, newPassword: string) => {
      try {
        setLoading(true)
        await subuserService.resetPassword(id, newPassword)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Contraseña actualizada correctamente.',
        })
        fetchSubusers()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al cambiar la contraseña.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchSubusers],
  )

  const getPermisos = useCallback(async (id: string) => {
    return subuserService.getPermisos(id)
  }, [])

  const updatePermisos = useCallback(
    async (id: string, permisos: Record<string, string[]>) => {
      try {
        setLoading(true)
        await subuserService.updatePermisos(id, permisos)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Permisos actualizados correctamente.',
        })
        fetchSubusers()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar los permisos.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchSubusers],
  )

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
    resetPassword,
    getPermisos,
    updatePermisos,
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

  // La página llama fetchStats vía handleRefresh
  return { stats, loadingStats, fetchStats }
}


