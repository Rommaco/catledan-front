'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { PartoModal } from '@/components/parto/PartoModal'
import { CeloModal } from '@/components/celo/CeloModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useParto } from '@/hooks/parto/useParto'
import { useCelo } from '@/hooks/celo/useCelo'
import { ganadoService } from '@/lib/ganado/ganadoService'
import { useToast } from '@/hooks/useToast'
import type { Parto, CreatePartoData, UpdatePartoData } from '@/types/parto'
import type { Celo, CreateCeloData, UpdateCeloData } from '@/types/celo'
import type { Ganado } from '@/types/ganado'
import { PlusIcon, HeartIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

function ReproduccionContent() {
  const parto = useParto()
  const celo = useCelo()
  const { toast } = useToast()
  const [ganadoList, setGanadoList] = useState<Ganado[]>([])
  const [activeTab, setActiveTab] = useState<'partos' | 'celos'>('partos')
  const [isPartoModalOpen, setIsPartoModalOpen] = useState(false)
  const [isCeloModalOpen, setIsCeloModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedParto, setSelectedParto] = useState<Parto | null>(null)
  const [selectedCelo, setSelectedCelo] = useState<Celo | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState<{ type: 'parto' | 'celo'; id: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadGanado = useCallback(async () => {
    try {
      const res = await ganadoService.getAll({ limit: 500 })
      setGanadoList(Array.isArray(res.data) ? res.data : [])
    } catch {
      setGanadoList([])
    }
  }, [])

  useEffect(() => {
    loadGanado()
  }, [loadGanado])

  useEffect(() => {
    if (activeTab === 'partos') parto.fetchPartos({ page: parto.currentPage, limit: parto.pageSize })
    else celo.fetchCelos({ page: celo.currentPage, limit: celo.pageSize })
  }, [activeTab, parto.currentPage, parto.pageSize, celo.currentPage, celo.pageSize])

  const handleCreateParto = () => {
    setSelectedParto(null)
    setModalMode('create')
    setIsPartoModalOpen(true)
  }

  const handleEditParto = (p: Parto) => {
    setSelectedParto(p)
    setModalMode('edit')
    setIsPartoModalOpen(true)
  }

  const handleDeleteParto = (p: Parto) => {
    setToDelete({ type: 'parto', id: p._id })
    setIsConfirmOpen(true)
  }

  const handleCreateCelo = () => {
    setSelectedCelo(null)
    setModalMode('create')
    setIsCeloModalOpen(true)
  }

  const handleEditCelo = (c: Celo) => {
    setSelectedCelo(c)
    setModalMode('edit')
    setIsCeloModalOpen(true)
  }

  const handleDeleteCelo = (c: Celo) => {
    setToDelete({ type: 'celo', id: c._id })
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleteLoading(true)
    try {
      if (toDelete.type === 'parto') await parto.deleteParto(toDelete.id)
      else await celo.deleteCelo(toDelete.id)
      toast({ type: 'success', title: 'Eliminado', message: 'Registro eliminado correctamente.' })
      setIsConfirmOpen(false)
      setToDelete(null)
      if (activeTab === 'partos') parto.fetchPartos({ page: parto.currentPage, limit: parto.pageSize })
      else celo.fetchCelos({ page: celo.currentPage, limit: celo.pageSize })
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo eliminar.' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePartoSave = async (data: CreatePartoData | UpdatePartoData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') await parto.addParto(data as CreatePartoData)
      else if (selectedParto) await parto.updateParto(selectedParto._id, data as UpdatePartoData)
      toast({ type: 'success', title: 'Guardado', message: 'Parto registrado correctamente.' })
      setIsPartoModalOpen(false)
      parto.fetchPartos({ page: parto.currentPage, limit: parto.pageSize })
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'No se pudo guardar.' })
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  const handleCeloSave = async (data: CreateCeloData | UpdateCeloData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') await celo.addCelo(data as CreateCeloData)
      else if (selectedCelo) await celo.updateCelo(selectedCelo._id, data as UpdateCeloData)
      toast({ type: 'success', title: 'Guardado', message: 'Celo registrado correctamente.' })
      setIsCeloModalOpen(false)
      celo.fetchCelos({ page: celo.currentPage, limit: celo.pageSize })
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'No se pudo guardar.' })
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  const partoColumns = [
    { key: 'fecha', title: 'Fecha', dataIndex: 'fecha', width: 120, render: (v: string) => v ? new Date(v).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—' },
    { key: 'tipoParto', title: 'Tipo', dataIndex: 'tipoParto', width: 100, render: (v: string) => v ? v.charAt(0).toUpperCase() + v.slice(1) : '—' },
    { key: 'numeroCrias', title: 'Crías', dataIndex: 'numeroCrias', width: 80, render: (v: number) => v ?? '—' },
    { key: 'observaciones', title: 'Observaciones', dataIndex: 'observaciones', width: 200, render: (v: string) => (v && v.length > 50 ? `${v.slice(0, 50)}…` : v) || '—' },
  ]

  const celoColumns = [
    { key: 'fecha', title: 'Fecha', dataIndex: 'fecha', width: 120, render: (v: string) => v ? new Date(v).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—' },
    { key: 'observaciones', title: 'Observaciones', dataIndex: 'observaciones', width: 300, render: (v: string) => (v && v.length > 60 ? `${v.slice(0, 60)}…` : v) || '—' },
  ]

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reproducción</h1>
            <p className="text-gray-600">Partos y registros de celo del hato</p>
          </div>
        </div>

        <nav className="border-b border-gray-200">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('partos')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'partos' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4" />
              Partos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('celos')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'celos' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HeartIcon className="w-4 h-4" />
              Celos
            </button>
          </div>
        </nav>

        {activeTab === 'partos' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button variant="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={handleCreateParto}>
                Registrar parto
              </Button>
            </div>
            <EnhancedTable
              columns={partoColumns}
              data={parto.data}
              loading={parto.loading}
              onEdit={handleEditParto}
              onDelete={handleDeleteParto}
              onRefresh={() => parto.fetchPartos({ page: parto.currentPage, limit: parto.pageSize })}
              showFilters={false}
              customFilters={[]}
              pagination={{
                current: parto.currentPage,
                pageSize: parto.pageSize,
                total: parto.total,
                onChange: (page, newPageSize) => {
                  parto.setCurrentPage(page)
                  if (newPageSize !== parto.pageSize) parto.setPageSize(newPageSize)
                },
              }}
            />
          </div>
        )}

        {activeTab === 'celos' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button variant="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={handleCreateCelo}>
                Registrar celo
              </Button>
            </div>
            <EnhancedTable
              columns={celoColumns}
              data={celo.data}
              loading={celo.loading}
              onEdit={handleEditCelo}
              onDelete={handleDeleteCelo}
              onRefresh={() => celo.fetchCelos({ page: celo.currentPage, limit: celo.pageSize })}
              showFilters={false}
              customFilters={[]}
              pagination={{
                current: celo.currentPage,
                pageSize: celo.pageSize,
                total: celo.total,
                onChange: (page, newPageSize) => {
                  celo.setCurrentPage(page)
                  if (newPageSize !== celo.pageSize) celo.setPageSize(newPageSize)
                },
              }}
            />
          </div>
        )}

        <PartoModal
          isOpen={isPartoModalOpen}
          onClose={() => setIsPartoModalOpen(false)}
          onSave={handlePartoSave}
          parto={selectedParto}
          mode={modalMode}
          loading={modalLoading}
          ganadoList={ganadoList}
        />
        <CeloModal
          isOpen={isCeloModalOpen}
          onClose={() => setIsCeloModalOpen(false)}
          onSave={handleCeloSave}
          celo={selectedCelo}
          mode={modalMode}
          loading={modalLoading}
          ganadoList={ganadoList}
        />
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => { setIsConfirmOpen(false); setToDelete(null) }}
          onConfirm={confirmDelete}
          title="Eliminar registro"
          message={toDelete?.type === 'parto' ? '¿Eliminar este registro de parto?' : '¿Eliminar este registro de celo?'}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default function ReproduccionPage() {
  return (
    <ProtectedRoute>
      <ReproduccionContent />
    </ProtectedRoute>
  )
}
