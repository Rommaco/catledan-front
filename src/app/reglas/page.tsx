'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { ReglaModal } from '@/components/regla/ReglaModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useRegla } from '@/hooks/regla/useRegla'
import { useToast } from '@/hooks/useToast'
import type { Regla, CreateReglaData, UpdateReglaData } from '@/types/regla'
import { format } from 'date-fns'
import { PlusIcon, ScaleIcon } from '@heroicons/react/24/outline'

function ReglasContent() {
  const {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchReglas,
    addRegla,
    updateRegla,
    deleteRegla,
  } = useRegla()
  const { toast } = useToast()
  const safeData = Array.isArray(data) ? data : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedRegla, setSelectedRegla] = useState<Regla | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [reglaToDelete, setReglaToDelete] = useState<Regla | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleRefresh = useCallback(() => {
    fetchReglas({ page: currentPage, limit: pageSize })
  }, [fetchReglas, currentPage, pageSize])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  const handleCreateRegla = () => {
    setSelectedRegla(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditRegla = (regla: Regla) => {
    setSelectedRegla(regla)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteRegla = (regla: Regla) => {
    setReglaToDelete(regla)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!reglaToDelete) return
    try {
      setDeleteLoading(true)
      await deleteRegla(reglaToDelete._id)
      handleRefresh()
      setIsConfirmModalOpen(false)
      setReglaToDelete(null)
      toast({ type: 'success', title: 'Eliminado', message: 'Regla eliminada correctamente.' })
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: 'Error al eliminar la regla.' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (dataToSave: CreateReglaData | UpdateReglaData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await addRegla(dataToSave as CreateReglaData)
      } else if (selectedRegla) {
        await updateRegla(selectedRegla._id, dataToSave as UpdateReglaData)
      }
      handleRefresh()
      setIsModalOpen(false)
      toast({
        type: 'success',
        title: 'Éxito',
        message: modalMode === 'create' ? 'Regla creada correctamente.' : 'Regla actualizada correctamente.',
      })
    } catch (err) {
      toast({
        type: 'error',
        title: 'Error',
        message: modalMode === 'create' ? 'Error al crear la regla.' : 'Error al actualizar la regla.',
      })
    } finally {
      setModalLoading(false)
    }
  }

  const formatDate = useCallback((date: string | undefined) => {
    if (!date) return '—'
    const d = new Date(date)
    return Number.isNaN(d.getTime()) ? '—' : format(d, 'dd/MM/yyyy')
  }, [])

  const columns = useMemo(
    () => [
      {
        key: 'nombre',
        title: 'Nombre',
        dataIndex: 'nombre',
        render: (n: string) => <span className="font-medium text-gray-900">{n}</span>,
      },
      {
        key: 'condicion',
        title: 'Condición',
        dataIndex: 'condicion',
        render: (c: Regla['condicion']) => (
          <span className="text-sm text-gray-600">
            {c?.tipo ?? '—'} {c?.campo ? `(${c.campo} ${c.operador ?? ''} ${c.valor ?? ''})` : ''}
          </span>
        ),
      },
      {
        key: 'accion',
        title: 'Acción',
        dataIndex: 'accion',
        render: (a: Regla['accion']) => (
          <span className="text-sm text-gray-600">{a?.tipo ?? '—'} {a?.mensaje ? `: ${String(a.mensaje).slice(0, 40)}...` : ''}</span>
        ),
      },
      {
        key: 'activa',
        title: 'Activa',
        dataIndex: 'activa',
        render: (a: boolean) => (
          <span className={a ? 'text-green-600 font-medium' : 'text-gray-500'}>{a ? 'Sí' : 'No'}</span>
        ),
      },
      {
        key: 'createdAt',
        title: 'Creado',
        dataIndex: 'createdAt',
        render: (date: string) => formatDate(date),
      },
    ],
    [formatDate],
  )

  if (error && !safeData.length && !loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800">Error al cargar las reglas</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button onClick={handleRefresh} variant="primary" className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reglas</h1>
            <p className="text-gray-600">Reglas de negocio y automatizaciones</p>
          </div>
          <Button onClick={handleCreateRegla} variant="primary" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Regla
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard title="Total reglas" value={total.toString()} icon={<ScaleIcon className="w-6 h-6" />} />
          <StatsCard
            title="Activas"
            value={safeData.filter((r) => r.activa).length.toString()}
            icon={<ScaleIcon className="w-6 h-6" />}
          />
        </div>

        <EnhancedTable
          data={safeData}
          columns={columns}
          loading={loading}
          title="Tabla de reglas"
          onEdit={handleEditRegla}
          onDelete={handleDeleteRegla}
          onRefresh={handleRefresh}
          exportFilename="reglas"
          exportTitle="Reporte de Reglas"
          serverSidePagination
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: (page, newPageSize) => {
              setCurrentPage(page)
              if (newPageSize != null && newPageSize !== pageSize) setPageSize(newPageSize)
            },
          }}
        />

        <ReglaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          regla={selectedRegla}
          mode={modalMode}
          loading={modalLoading}
        />

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setReglaToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar regla"
          message={`¿Estás seguro de que quieres eliminar la regla "${reglaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default function ReglasPage() {
  return (
    <ProtectedRoute>
      <ReglasContent />
    </ProtectedRoute>
  )
}
