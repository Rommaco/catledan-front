'use client'
import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { useSanidad } from '@/hooks/sanidad/useSanidad'
import { useToast } from '@/hooks/useToast'
import { ShieldCheckIcon, BeakerIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

function SanidadContent() {
  const {
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
    deleteVacuna,
    deleteTratamiento,
  } = useSanidad()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'vacunas' | 'tratamientos'>('vacunas')

  useEffect(() => {
    if (activeTab === 'vacunas') fetchVacunas({ page: pageVacunas })
    else fetchTratamientos({ page: pageTratamientos })
  }, [activeTab, pageVacunas, pageTratamientos])

  const handleRefresh = () => {
    if (activeTab === 'vacunas') fetchVacunas({ page: pageVacunas })
    else fetchTratamientos({ page: pageTratamientos })
  }

  const handleDeleteVacuna = async (id: string) => {
    if (!confirm('¿Eliminar este registro de vacunación?')) return
    try {
      await deleteVacuna(id)
      toast({ type: 'success', title: 'Eliminado', message: 'Registro de vacuna eliminado.' })
      handleRefresh()
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo eliminar.' })
    }
  }

  const handleDeleteTratamiento = async (id: string) => {
    if (!confirm('¿Eliminar este registro de tratamiento?')) return
    try {
      await deleteTratamiento(id)
      toast({ type: 'success', title: 'Eliminado', message: 'Registro de tratamiento eliminado.' })
      handleRefresh()
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo eliminar.' })
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sanidad del hato</h1>
          <p className="text-gray-600">
            Vista general de vacunaciones y tratamientos. Para registrar nuevas vacunas o tratamientos, ve al módulo de{' '}
            <Link href="/ganado" className="text-green-600 hover:underline font-medium">Ganado</Link> → Sanidad.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-amber-800">No se pudieron cargar los datos. El backend puede no estar disponible.</p>
            <Button variant="secondary" size="sm" onClick={handleRefresh}>Reintentar</Button>
          </div>
        )}

        <nav className="border-b border-gray-200">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('vacunas')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'vacunas' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4" />
              Vacunaciones
              <span className="ml-1 text-xs text-gray-400">({totalVacunas})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tratamientos')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tratamientos' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BeakerIcon className="w-4 h-4" />
              Tratamientos
              <span className="ml-1 text-xs text-gray-400">({totalTratamientos})</span>
            </button>
          </div>
        </nav>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
              <p className="mt-2">Cargando…</p>
            </div>
          ) : activeTab === 'vacunas' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {vacunas.length ? vacunas.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm text-gray-900">{v.fecha ? new Date(v.fecha).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{v.tipo || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{v.lote || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{v.observaciones || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteVacuna(v._id)}>Eliminar</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Sin registros de vacunaciones.</td></tr>
                  )}
                </tbody>
              </table>
              {totalVacunas > 10 && (
                <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
                  <Button variant="secondary" size="sm" disabled={pageVacunas <= 1} onClick={() => setPageVacunas((p) => p - 1)}>Anterior</Button>
                  <span className="py-1 px-2 text-sm text-gray-600">Pág. {pageVacunas}</span>
                  <Button variant="secondary" size="sm" disabled={pageVacunas * 10 >= totalVacunas} onClick={() => setPageVacunas((p) => p + 1)}>Siguiente</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto / Dosis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {tratamientos.length ? tratamientos.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm text-gray-900">{t.fecha ? new Date(t.fecha).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{t.tipo || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.producto || t.dosis || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{t.observaciones || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTratamiento(t._id)}>Eliminar</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Sin registros de tratamientos.</td></tr>
                  )}
                </tbody>
              </table>
              {totalTratamientos > 10 && (
                <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
                  <Button variant="secondary" size="sm" disabled={pageTratamientos <= 1} onClick={() => setPageTratamientos((p) => p - 1)}>Anterior</Button>
                  <span className="py-1 px-2 text-sm text-gray-600">Pág. {pageTratamientos}</span>
                  <Button variant="secondary" size="sm" disabled={pageTratamientos * 10 >= totalTratamientos} onClick={() => setPageTratamientos((p) => p + 1)}>Siguiente</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SanidadPage() {
  return (
    <ProtectedRoute>
      <SanidadContent />
    </ProtectedRoute>
  )
}
