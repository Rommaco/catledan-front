'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { InsumoModal } from '@/components/insumo/InsumoModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useInsumo } from '@/hooks/insumo/useInsumo'
import { useToast } from '@/hooks/useToast'
import type { Insumo, CreateInsumoData, UpdateInsumoData } from '@/types/insumo'
import { format } from 'date-fns'
import { PlusIcon, CubeIcon } from '@heroicons/react/24/outline'

function InsumosContent() {
  const {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchInsumos,
    addInsumo,
    updateInsumo,
    deleteInsumo,
  } = useInsumo()
  const { toast } = useToast()
  const safeData = Array.isArray(data) ? data : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [insumoToDelete, setInsumoToDelete] = useState<Insumo | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleRefresh = useCallback(() => {
    fetchInsumos({ page: currentPage, limit: pageSize })
  }, [fetchInsumos, currentPage, pageSize])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  const handleCreateInsumo = () => {
    setSelectedInsumo(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditInsumo = (insumo: Insumo) => {
    setSelectedInsumo(insumo)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteInsumo = (insumo: Insumo) => {
    setInsumoToDelete(insumo)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!insumoToDelete) return
    try {
      setDeleteLoading(true)
      await deleteInsumo(insumoToDelete._id)
      handleRefresh()
      setIsConfirmModalOpen(false)
      setInsumoToDelete(null)
      toast({ type: 'success', title: 'Eliminado', message: 'Insumo eliminado correctamente.' })
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: 'Error al eliminar el insumo.' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (dataToSave: CreateInsumoData | UpdateInsumoData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await addInsumo(dataToSave as CreateInsumoData)
      } else if (selectedInsumo) {
        await updateInsumo(selectedInsumo._id, dataToSave as UpdateInsumoData)
      }
      handleRefresh()
      setIsModalOpen(false)
      toast({
        type: 'success',
        title: 'Éxito',
        message: modalMode === 'create' ? 'Insumo creado correctamente.' : 'Insumo actualizado correctamente.',
      })
    } catch (err) {
      toast({
        type: 'error',
        title: 'Error',
        message: modalMode === 'create' ? 'Error al crear el insumo.' : 'Error al actualizar el insumo.',
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
        render: (nombre: string) => <span className="font-medium text-gray-900">{nombre}</span>,
      },
      {
        key: 'tipo',
        title: 'Tipo',
        dataIndex: 'tipo',
        render: (t: string) => <span className="text-sm capitalize">{t}</span>,
      },
      {
        key: 'cantidad',
        title: 'Cantidad',
        dataIndex: 'cantidad',
        render: (cant: number, row: Insumo) => (
          <span className="tabular-nums">
            {cant} {row.unidad}
          </span>
        ),
      },
      {
        key: 'umbralMinimo',
        title: 'Umbral mín.',
        dataIndex: 'umbralMinimo',
        render: (u: number, row: Insumo) => (
          <span className={u > 0 && row.cantidad <= u ? 'text-amber-600 font-medium' : ''}>
            {u} {row.unidad}
          </span>
        ),
      },
      {
        key: 'observaciones',
        title: 'Observaciones',
        dataIndex: 'observaciones',
        render: (o: string) => <span className="text-sm text-gray-600 truncate max-w-[180px] block">{o || '—'}</span>,
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
            <h3 className="text-lg font-medium text-red-800">Error al cargar los insumos</h3>
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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
            <p className="text-gray-600">Inventario y control de insumos</p>
          </div>
          <Button onClick={handleCreateInsumo} variant="primary" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Insumo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard title="Total insumos" value={total.toString()} icon={<CubeIcon className="w-6 h-6" />} />
          <StatsCard
            title="Por debajo del umbral"
            value={safeData.filter((i) => i.umbralMinimo > 0 && i.cantidad <= i.umbralMinimo).length.toString()}
            icon={<CubeIcon className="w-6 h-6" />}
          />
        </div>

        <EnhancedTable
          data={safeData}
          columns={columns}
          loading={loading}
          title="Tabla de insumos"
          onEdit={handleEditInsumo}
          onDelete={handleDeleteInsumo}
          onRefresh={handleRefresh}
          exportFilename="insumos"
          exportTitle="Reporte de Insumos"
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

        <InsumoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          insumo={selectedInsumo}
          mode={modalMode}
          loading={modalLoading}
        />

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setInsumoToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar insumo"
          message={`¿Estás seguro de que quieres eliminar el insumo "${insumoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default function InsumosPage() {
  return (
    <ProtectedRoute>
      <InsumosContent />
    </ProtectedRoute>
  )
}
