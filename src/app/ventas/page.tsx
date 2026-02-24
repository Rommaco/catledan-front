'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { VentaModal } from '@/components/venta/VentaModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useVenta } from '@/hooks/venta/useVenta'
import { useToast } from '@/hooks/useToast'
import type { Venta, CreateVentaData, UpdateVentaData } from '@/types/venta'
import { format } from 'date-fns'
import { PlusIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

function VentasContent() {
  const {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchVentas,
    addVenta,
    updateVenta,
    deleteVenta,
  } = useVenta()
  const { toast } = useToast()
  const safeData = Array.isArray(data) ? data : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [ventaToDelete, setVentaToDelete] = useState<Venta | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleRefresh = useCallback(() => {
    fetchVentas({ page: currentPage, limit: pageSize })
  }, [fetchVentas, currentPage, pageSize])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  const handleCreateVenta = () => {
    setSelectedVenta(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditVenta = (venta: Venta) => {
    setSelectedVenta(venta)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteVenta = (venta: Venta) => {
    setVentaToDelete(venta)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!ventaToDelete) return
    try {
      setDeleteLoading(true)
      await deleteVenta(ventaToDelete._id)
      handleRefresh()
      setIsConfirmModalOpen(false)
      setVentaToDelete(null)
      toast({ type: 'success', title: 'Eliminado', message: 'Venta eliminada correctamente.' })
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: 'Error al eliminar la venta.' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (dataToSave: CreateVentaData | UpdateVentaData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await addVenta(dataToSave as CreateVentaData)
      } else if (selectedVenta) {
        await updateVenta(selectedVenta._id, dataToSave as UpdateVentaData)
      }
      handleRefresh()
      setIsModalOpen(false)
      toast({
        type: 'success',
        title: 'Éxito',
        message: modalMode === 'create' ? 'Venta registrada correctamente.' : 'Venta actualizada correctamente.',
      })
    } catch (err) {
      toast({
        type: 'error',
        title: 'Error',
        message: modalMode === 'create' ? 'Error al registrar la venta.' : 'Error al actualizar la venta.',
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

  const formatMonto = useCallback((m: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(m ?? 0)
  }, [])

  const columns = useMemo(
    () => [
      {
        key: 'fecha',
        title: 'Fecha',
        dataIndex: 'fecha',
        render: (f: string) => formatDate(f?.slice(0, 10)),
      },
      {
        key: 'tipo',
        title: 'Tipo',
        dataIndex: 'tipo',
        render: (t: string) => <span className="text-sm capitalize">{t}</span>,
      },
      {
        key: 'concepto',
        title: 'Concepto',
        dataIndex: 'concepto',
        render: (c: string) => <span className="font-medium text-gray-900">{c}</span>,
      },
      {
        key: 'cantidad',
        title: 'Cant.',
        dataIndex: 'cantidad',
        render: (c: number) => <span className="tabular-nums">{c}</span>,
      },
      {
        key: 'monto',
        title: 'Monto',
        dataIndex: 'monto',
        render: (m: number) => <span className="tabular-nums font-medium text-green-700">{formatMonto(m)}</span>,
      },
      {
        key: 'comprador',
        title: 'Comprador',
        dataIndex: 'comprador',
        render: (c: string) => <span className="text-sm text-gray-600">{c || '—'}</span>,
      },
      {
        key: 'createdAt',
        title: 'Registrado',
        dataIndex: 'createdAt',
        render: (date: string) => formatDate(date),
      },
    ],
    [formatDate, formatMonto],
  )

  const totalMonto = useMemo(() => safeData.reduce((sum, v) => sum + (v.monto ?? 0), 0), [safeData])

  if (error && !safeData.length && !loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800">Error al cargar las ventas</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
            <p className="text-gray-600">Registro de ventas e ingresos</p>
          </div>
          <Button onClick={handleCreateVenta} variant="primary" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Venta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard title="Total ventas" value={total.toString()} icon={<CurrencyDollarIcon className="w-6 h-6" />} />
          <StatsCard
            title="Monto total (página)"
            value={formatMonto(totalMonto)}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
          />
        </div>

        <EnhancedTable
          data={safeData}
          columns={columns}
          loading={loading}
          title="Tabla de ventas"
          onEdit={handleEditVenta}
          onDelete={handleDeleteVenta}
          onRefresh={handleRefresh}
          exportFilename="ventas"
          exportTitle="Reporte de Ventas"
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

        <VentaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          venta={selectedVenta}
          mode={modalMode}
          loading={modalLoading}
        />

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setVentaToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar venta"
          message={`¿Estás seguro de que quieres eliminar la venta "${ventaToDelete?.concepto}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default function VentasPage() {
  return (
    <ProtectedRoute>
      <VentasContent />
    </ProtectedRoute>
  )
}
