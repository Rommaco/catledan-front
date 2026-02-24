'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { useAlerta } from '@/hooks/alerta/useAlerta'
import { useToast } from '@/hooks/useToast'
import type { Alerta } from '@/types/alerta'
import { format } from 'date-fns'
import { BellAlertIcon, CheckIcon } from '@heroicons/react/24/outline'
import { CustomSelect } from '@/components/ui/CustomSelect'

const FILTER_LEIDO_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'false', label: 'No leídas' },
  { value: 'true', label: 'Leídas' },
]

function AlertasContent() {
  const {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    filterLeido,
    setCurrentPage,
    setPageSize,
    setFilterLeido,
    fetchAlertas,
    markAsRead,
  } = useAlerta()
  const { toast } = useToast()
  const safeData = Array.isArray(data) ? data : []

  const [markingId, setMarkingId] = useState<string | null>(null)

  const handleRefresh = useCallback(() => {
    fetchAlertas({ page: currentPage, limit: pageSize, leido: filterLeido })
  }, [fetchAlertas, currentPage, pageSize, filterLeido])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  const handleMarkAsRead = useCallback(
    async (alerta: Alerta) => {
      if (alerta.leido) return
      try {
        setMarkingId(alerta._id)
        await markAsRead(alerta._id)
        handleRefresh()
        toast({ type: 'success', title: 'Listo', message: 'Alerta marcada como leída.' })
      } catch (err) {
        toast({ type: 'error', title: 'Error', message: 'No se pudo marcar la alerta como leída.' })
      } finally {
        setMarkingId(null)
      }
    },
    [markAsRead, handleRefresh, toast],
  )

  const handleFilterLeidoChange = useCallback((value: string | number) => {
    const v = String(value)
    setFilterLeido(v === '' ? undefined : v === 'true')
  }, [setFilterLeido])

  const formatDate = useCallback((date: string | undefined) => {
    if (!date) return '—'
    const d = new Date(date)
    return Number.isNaN(d.getTime()) ? '—' : format(d, 'dd/MM/yyyy HH:mm')
  }, [])

  const columns = useMemo(
    () => [
      {
        key: 'tipo',
        title: 'Tipo',
        dataIndex: 'tipo',
        render: (t: string) => <span className="text-sm font-medium capitalize">{t}</span>,
      },
      {
        key: 'titulo',
        title: 'Título',
        dataIndex: 'titulo',
        render: (tit: string) => <span className="font-medium text-gray-900">{tit}</span>,
      },
      {
        key: 'mensaje',
        title: 'Mensaje',
        dataIndex: 'mensaje',
        render: (m: string) => <span className="text-sm text-gray-600 line-clamp-2 max-w-xs">{m}</span>,
      },
      {
        key: 'leido',
        title: 'Estado',
        dataIndex: 'leido',
        render: (leido: boolean) => (
          <span className={leido ? 'text-green-600' : 'text-amber-600 font-medium'}>
            {leido ? 'Leída' : 'No leída'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        title: 'Fecha',
        dataIndex: 'createdAt',
        render: (date: string) => formatDate(date),
      },
      {
        key: 'accion',
        title: 'Acción',
        dataIndex: '_id',
        render: (_: string, row: Alerta) =>
          !row.leido ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleMarkAsRead(row)}
              disabled={markingId === row._id}
            >
              <CheckIcon className="h-4 w-4 mr-1 inline" />
              Marcar leída
            </Button>
          ) : (
            '—'
          ),
      },
    ],
    [formatDate, markingId, handleMarkAsRead],
  )

  if (error && !safeData.length && !loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800">Error al cargar las alertas</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
            <p className="text-gray-600">Notificaciones y avisos del sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Estado:</span>
            <CustomSelect
              value={filterLeido === undefined ? '' : filterLeido ? 'true' : 'false'}
              onChange={handleFilterLeidoChange}
              options={FILTER_LEIDO_OPTIONS}
              placeholder="Todas"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard title="Total alertas" value={total.toString()} icon={<BellAlertIcon className="w-6 h-6" />} />
          <StatsCard
            title="No leídas"
            value={safeData.filter((a) => !a.leido).length.toString()}
            icon={<BellAlertIcon className="w-6 h-6" />}
          />
        </div>

        <EnhancedTable
          data={safeData}
          columns={columns}
          loading={loading}
          title="Listado de alertas"
          onRefresh={handleRefresh}
          exportFilename="alertas"
          exportTitle="Reporte de Alertas"
          showActions={false}
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
      </div>
    </DashboardLayout>
  )
}

export default function AlertasPage() {
  return (
    <ProtectedRoute>
      <AlertasContent />
    </ProtectedRoute>
  )
}
