'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { ParcelaModal } from '@/components/parcela/ParcelaModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useParcela } from '@/hooks/parcela/useParcela'
import { useToast } from '@/hooks/useToast'
import type { Parcela, CreateParcelaData, UpdateParcelaData } from '@/types/parcela'
import { format } from 'date-fns'
import { PlusIcon, MapIcon } from '@heroicons/react/24/outline'

function ParcelasContent() {
  const {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchParcelas,
    addParcela,
    updateParcela,
    deleteParcela,
  } = useParcela()
  const { toast } = useToast()
  const safeData = Array.isArray(data) ? data : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [parcelaToDelete, setParcelaToDelete] = useState<Parcela | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleRefresh = useCallback(() => {
    fetchParcelas({ page: currentPage, limit: pageSize })
  }, [fetchParcelas, currentPage, pageSize])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  const handleCreateParcela = () => {
    setSelectedParcela(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditParcela = (parcela: Parcela) => {
    setSelectedParcela(parcela)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteParcela = (parcela: Parcela) => {
    setParcelaToDelete(parcela)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!parcelaToDelete) return
    try {
      setDeleteLoading(true)
      await deleteParcela(parcelaToDelete._id)
      handleRefresh()
      setIsConfirmModalOpen(false)
      setParcelaToDelete(null)
      toast({ type: 'success', title: 'Eliminado', message: 'Parcela eliminada correctamente.' })
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: 'Error al eliminar la parcela.' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (dataToSave: CreateParcelaData | UpdateParcelaData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await addParcela(dataToSave as CreateParcelaData)
      } else if (selectedParcela) {
        await updateParcela(selectedParcela._id, dataToSave as UpdateParcelaData)
      }
      handleRefresh()
      setIsModalOpen(false)
      toast({
        type: 'success',
        title: 'Éxito',
        message: modalMode === 'create' ? 'Parcela creada correctamente.' : 'Parcela actualizada correctamente.',
      })
    } catch (err) {
      toast({
        type: 'error',
        title: 'Error',
        message: modalMode === 'create' ? 'Error al crear la parcela.' : 'Error al actualizar la parcela.',
      })
    } finally {
      setModalLoading(false)
    }
  }

  const formatArea = useCallback((ha: number | undefined) => {
    if (ha == null || Number.isNaN(Number(ha))) return '0.00'
    return Number(ha).toFixed(2)
  }, [])

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
        key: 'direccion',
        title: 'Dirección',
        dataIndex: 'direccion',
        render: (d: string) => <span className="text-sm text-gray-600">{d || '—'}</span>,
      },
      {
        key: 'region',
        title: 'Región',
        dataIndex: 'region',
        render: (r: string) => <span className="text-sm">{r}</span>,
      },
      {
        key: 'estado',
        title: 'Estado / Depto',
        dataIndex: 'estado',
        render: (e: string) => <span className="text-sm">{e}</span>,
      },
      {
        key: 'municipio',
        title: 'Municipio',
        dataIndex: 'municipio',
        render: (m: string) => <span className="text-sm">{m}</span>,
      },
      {
        key: 'areaHectareas',
        title: 'Área (ha)',
        dataIndex: 'areaHectareas',
        render: (ha: number) => <span className="tabular-nums">{formatArea(ha)}</span>,
      },
      {
        key: 'createdAt',
        title: 'Creado',
        dataIndex: 'createdAt',
        render: (date: string) => formatDate(date),
      },
    ],
    [formatArea, formatDate],
  )

  if (error && !safeData.length && !loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800">Error al cargar las parcelas</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Parcelas</h1>
            <p className="text-gray-600">Gestiona parcelas y lotes</p>
          </div>
          <Button onClick={handleCreateParcela} variant="primary" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Parcela
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total parcelas"
            value={total.toString()}
            icon={<MapIcon className="w-6 h-6" />}
          />
          <StatsCard
            title="Área total (ha)"
            value={safeData.reduce((sum, p) => sum + (p.areaHectareas ?? 0), 0).toFixed(2)}
            icon={<MapIcon className="w-6 h-6" />}
          />
        </div>

        <EnhancedTable
          data={safeData}
          columns={columns}
          loading={loading}
          title="Tabla de parcelas"
          onEdit={handleEditParcela}
          onDelete={handleDeleteParcela}
          onRefresh={handleRefresh}
          exportFilename="parcelas"
          exportTitle="Reporte de Parcelas"
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

        <ParcelaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          parcela={selectedParcela}
          mode={modalMode}
          loading={modalLoading}
        />

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setParcelaToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar parcela"
          message={`¿Estás seguro de que quieres eliminar la parcela "${parcelaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default function ParcelasPage() {
  return (
    <ProtectedRoute>
      <ParcelasContent />
    </ProtectedRoute>
  )
}
