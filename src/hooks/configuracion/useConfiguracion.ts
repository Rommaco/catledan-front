'use client'
import { useState, useCallback, useEffect } from 'react'
import { configuracionService } from '@/lib/configuracion/configuracionService'
import {
  Configuracion,
  ConfiguracionEmpresa,
  ConfiguracionUsuario,
  ConfiguracionSistema,
  UpdateConfiguracionData,
  getConfiguracionDefault,
} from '@/types/configuracion'
import { useToast } from '../useToast'

export const useConfiguracion = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchConfiguracion = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await configuracionService.get()
      setConfiguracion(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error al cargar configuración:', err)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar la configuración.',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const createConfiguracion = useCallback(
    async (data: {
      empresa: ConfiguracionEmpresa
      usuario: ConfiguracionUsuario
      sistema: ConfiguracionSistema
    }) => {
      try {
        setLoading(true)
        const response = await configuracionService.create(data)
        setConfiguracion(response.configuracion)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Configuración creada correctamente.',
        })
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al crear la configuración.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateConfiguracion = useCallback(
    async (data: UpdateConfiguracionData) => {
      try {
        setLoading(true)
        const response = await configuracionService.update(data)
        setConfiguracion(response.configuracion)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Configuración actualizada correctamente.',
        })
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar la configuración.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateEmpresa = useCallback(
    async (empresa: ConfiguracionEmpresa) => {
      try {
        setLoading(true)
        const response = await configuracionService.updateEmpresa(empresa)
        setConfiguracion(response.configuracion)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Configuración de empresa actualizada correctamente.',
        })
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar la configuración de empresa.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateUsuario = useCallback(
    async (usuario: ConfiguracionUsuario) => {
      try {
        setLoading(true)
        const response = await configuracionService.updateUsuario(usuario)
        setConfiguracion(response.configuracion)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Configuración de usuario actualizada correctamente.',
        })
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar la configuración de usuario.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateSistema = useCallback(
    async (sistema: ConfiguracionSistema) => {
      try {
        setLoading(true)
        const response = await configuracionService.updateSistema(sistema)
        setConfiguracion(response.configuracion)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Configuración del sistema actualizada correctamente.',
        })
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar la configuración del sistema.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const deleteConfiguracion = useCallback(async () => {
    try {
      setLoading(true)
      await configuracionService.delete()
      setConfiguracion(null)
      toast({
        type: 'success',
        title: 'Éxito',
        message: 'Configuración eliminada correctamente.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar la configuración.',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const refreshConfiguracion = useCallback(async () => {
    await fetchConfiguracion()
  }, [fetchConfiguracion])

  // Cargar configuración al montar el componente
  useEffect(() => {
    fetchConfiguracion()
  }, [fetchConfiguracion])

  return {
    configuracion: configuracion || getConfiguracionDefault(),
    loading,
    error,
    fetchConfiguracion,
    createConfiguracion,
    updateConfiguracion,
    updateEmpresa,
    updateUsuario,
    updateSistema,
    deleteConfiguracion,
    refreshConfiguracion,
  }
}
