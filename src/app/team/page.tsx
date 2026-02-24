'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { Badge } from '@/components/ui/Badge'
import { StatsCard } from '@/components/ui/StatsCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { SubuserModal } from '@/components/subuser/SubuserModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Modal } from '@/components/ui/Modal'
import { useSubuser, useSubuserStats } from '@/hooks/subuser/useSubuser'
import { useToast } from '@/hooks/useToast'
import {
  Subuser,
  CreateSubuserData,
  UpdateSubuserData,
  ROLES_SUBUSER,
  PERMISOS_SUBUSER,
  getRolColor,
  getPermisoColor,
  getStatusColor,
  getStatusText,
} from '@/types/subuser'
import { format } from 'date-fns'
import {
  PlusIcon,
  UsersIcon,
  UserPlusIcon,
  KeyIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline'

function TeamContent() {
  const {
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
  } = useSubuser()

  const { stats, loadingStats, fetchStats } = useSubuserStats()
  const { toast } = useToast()
  const safeData = Array.isArray(data) ? data : []

  // Estados del modal de subusuario
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedSubuser, setSelectedSubuser] = useState<Subuser | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Estados para modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [subuserToDelete, setSubuserToDelete] = useState<Subuser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Estados para modal de confirmación de contraseñas
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Modal contraseña temporal (tras crear)
  const [tempPasswordModal, setTempPasswordModal] = useState<{ fullName: string; password: string } | null>(null)

  // Modal cambiar contraseña de un subusuario
  const [resetPasswordSubuser, setResetPasswordSubuser] = useState<Subuser | null>(null)
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)

  // Modal permisos de un subusuario (todos los módulos: ganado, reportes, etc.)
  const [subuserForPermisos, setSubuserForPermisos] = useState<Subuser | null>(null)
  const [permisosMap, setPermisosMap] = useState<Record<string, string[]>>({})
  const [permisosMapLoading, setPermisosMapLoading] = useState(false)
  const [permisosModalLoading, setPermisosModalLoading] = useState(false)

  const handleRefresh = useCallback(() => {
    fetchSubusers({
      page: currentPage,
      limit: pageSize
    })
    fetchStats()
  }, [
    fetchSubusers,
    fetchStats,
    currentPage,
    pageSize
  ])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  const handleCreateSubuser = () => {
    setSelectedSubuser(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditSubuser = (subuser: Subuser) => {
    setSelectedSubuser(subuser)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteSubuser = (subuser: Subuser) => {
    setSubuserToDelete(subuser)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!subuserToDelete) return

    try {
      setDeleteLoading(true)
      await deleteSubuser(subuserToDelete._id)
      toast({
        type: 'success',
        title: 'Eliminado',
        message: 'Subusuario eliminado correctamente.',
      })
      handleRefresh()
      setIsConfirmModalOpen(false)
      setSubuserToDelete(null)
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Hubo un error al eliminar el subusuario.',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRefreshPasswords = () => {
    setIsPasswordModalOpen(true)
  }

  const confirmRefreshPasswords = async () => {
    try {
      setPasswordLoading(true)
      await refreshPasswords()
      toast({
        type: 'success',
        title: 'Éxito',
        message: 'Contraseñas actualizadas correctamente.',
      })
      handleRefresh()
      setIsPasswordModalOpen(false)
    } catch (error) {
      console.error('Error al actualizar contraseñas:', error)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Hubo un error al actualizar las contraseñas.',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleModalSave = async (dataToSave: CreateSubuserData | UpdateSubuserData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        const result = await addSubuser(dataToSave as CreateSubuserData)
        setIsModalOpen(false)
        handleRefresh()
        if (result?.temporaryPassword) {
          setTempPasswordModal({
            fullName: (dataToSave as CreateSubuserData).fullName,
            password: result.temporaryPassword,
          })
        } else {
          toast({
            type: 'success',
            title: 'Éxito',
            message: 'Subusuario creado correctamente.',
          })
        }
      } else if (selectedSubuser) {
        await updateSubuser(selectedSubuser._id, dataToSave as UpdateSubuserData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Subusuario actualizado correctamente.',
        })
        handleRefresh()
        setIsModalOpen(false)
      }
    } catch (err) {
      console.error('Error al guardar subusuario:', err)
      toast({
        type: 'error',
        title: 'Error',
        message: `Hubo un error al ${modalMode === 'create' ? 'crear' : 'actualizar'} el subusuario.`,
      })
    } finally {
      setModalLoading(false)
    }
  }

  const handleResetPasswordClick = (subuser: Subuser) => {
    setResetPasswordSubuser(subuser)
    setResetPasswordValue('')
  }

  // Módulos con permisos (lectura/escritura) — mismos keys que el backend
  const MODULOS_PERMISOS: { key: string; label: string }[] = [
    { key: 'ganado', label: 'Ganado' },
    { key: 'produccion-leche', label: 'Producción de leche' },
    { key: 'cultivos', label: 'Cultivos' },
    { key: 'reportes', label: 'Reportes' },
    { key: 'finanzas', label: 'Finanzas' },
    { key: 'subusers', label: 'Team (Subusuarios)' },
    { key: 'configuracion', label: 'Configuración' },
    { key: 'parcelas', label: 'Parcelas' },
    { key: 'perfil', label: 'Perfil' },
    { key: 'alertas', label: 'Alertas' },
  ]

  const handleOpenPermisos = async (subuser: Subuser) => {
    setSubuserForPermisos(subuser)
    setPermisosMapLoading(true)
    setPermisosMap({})
    try {
      const map = await getPermisos(subuser._id)
      setPermisosMap(map && typeof map === 'object' ? map : {})
    } catch (err) {
      console.error('Error al cargar permisos:', err)
      toast({ type: 'error', title: 'Error', message: 'Error al cargar los permisos.' })
    } finally {
      setPermisosMapLoading(false)
    }
  }

  const togglePermisoModulo = (modulo: string, accion: 'read' | 'write') => {
    setPermisosMap((prev) => {
      const arr = prev[modulo] ?? []
      const next = arr.includes(accion) ? arr.filter((a) => a !== accion) : [...arr, accion]
      return { ...prev, [modulo]: next }
    })
  }

  const handleSavePermisos = async () => {
    if (!subuserForPermisos) return
    const toSend = Object.fromEntries(
      Object.entries(permisosMap).filter(([, arr]) => arr.length > 0)
    )
    setPermisosModalLoading(true)
    try {
      await updatePermisos(subuserForPermisos._id, toSend)
      handleRefresh()
      setSubuserForPermisos(null)
    } catch (err) {
      console.error('Error al guardar permisos:', err)
    } finally {
      setPermisosModalLoading(false)
    }
  }

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordSubuser || !resetPasswordValue.trim()) return
    if (resetPasswordValue.length < 8) {
      toast({ type: 'error', title: 'Error', message: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }
    setResetPasswordLoading(true)
    try {
      await resetPassword(resetPasswordSubuser._id, resetPasswordValue.trim())
      setResetPasswordSubuser(null)
      setResetPasswordValue('')
    } finally {
      setResetPasswordLoading(false)
    }
  }

  const copyTempPassword = () => {
    if (tempPasswordModal?.password) {
      navigator.clipboard.writeText(tempPasswordModal.password)
      toast({ type: 'success', title: 'Copiado', message: 'Contraseña copiada al portapapeles.' })
    }
  }

  const columns = useMemo(() => [
    {
      key: 'fullName',
      title: 'Nombre',
      dataIndex: 'fullName',
      render: (fullName: string, record: Subuser) => (
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            record.isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span className="font-medium text-gray-900">{fullName}</span>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      render: (email: string) => (
        <span className="text-sm text-gray-600">{email}</span>
      ),
    },
    {
      key: 'rol',
      title: 'Rol',
      dataIndex: 'rol',
      render: (rol: string, record: Subuser) => {
        const rolText = record.permisos.includes('administrativo') ? 'Administrativo' : 'Trabajador'
        return (
          <Badge variant={rolText === 'Administrativo' ? 'success' : 'info'} size="sm">
            {rolText}
          </Badge>
        )
      },
    },
    {
      key: 'permisos',
      title: 'Permisos',
      dataIndex: 'permisos',
      render: (permisos: string[]) => {
        const acciones = (permisos || []).filter((p) => p !== 'administrativo' && p !== 'trabajador')
        const labels: Record<string, string> = { read: 'Lectura', write: 'Escritura', delete: 'Eliminación', export: 'Exportación' }
        const variantMap: Record<string, 'info' | 'success' | 'warning' | 'error' | 'default'> = {
          read: 'info', write: 'success', delete: 'error', export: 'info',
        }
        return (
          <div className="flex flex-wrap gap-1">
            {acciones.length ? acciones.map((permiso) => (
              <Badge key={permiso} variant={variantMap[permiso] ?? 'default'} size="sm">
                {labels[permiso] ?? permiso}
              </Badge>
            )) : <span className="text-gray-400 text-sm">—</span>}
          </div>
        )
      },
    },
    {
      key: 'status',
      title: 'Estado',
      dataIndex: 'isOnline',
      render: (isOnline: boolean, record: Subuser) => (
        <div className="flex flex-col">
          <Badge variant={getStatusColor(isOnline)} size="sm">
            {isOnline ? 'En línea' : 'Desconectado'}
          </Badge>
          {!isOnline && record.lastSeen && (
            <span className="text-xs text-gray-500 mt-1">
              {getStatusText(isOnline, record.lastSeen)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'password',
      title: 'Contraseña',
      dataIndex: 'currentTempPassword',
      render: (password: string, record: Subuser) => (
        <div className="flex flex-col">
          {password ? (
            <Badge variant="info" size="sm">
              <KeyIcon className="w-3 h-3 mr-1" />
              {password}
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              Expirada
            </Badge>
          )}
          {record.tempPasswordExpires && (
            <span className="text-xs text-gray-500 mt-1">
              Expira: {format(new Date(record.tempPasswordExpires), 'dd/MM/yyyy')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Creado',
      dataIndex: 'createdAt',
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy'),
    },
  ], [])

  const rolOptions = [
    { value: '', label: 'Todos los roles' },
    ...ROLES_SUBUSER.map(r => ({ value: r.value, label: r.label })),
  ]

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'online', label: 'En línea' },
    { value: 'offline', label: 'Desconectado' },
  ]

  if (error && !data.length && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Error al cargar los subusuarios</h3>
          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>
          <Button onClick={handleRefresh} variant="primary" className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-600">Gestiona los subusuarios de tu equipo</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button
              onClick={handleRefreshPasswords}
              variant="secondary"
              size="lg"
              loading={passwordLoading}
            >
              <KeyIcon className="w-5 h-5 mr-2" />
              Actualizar Contraseñas
            </Button>
            <Button
              onClick={handleCreateSubuser}
              variant="primary"
              size="lg"
              className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nuevo Subusuario
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Subusuarios"
            value={stats.totalSubusers}
            icon={<UsersIcon className="w-6 h-6" />}
            color="blue"
            loading={loadingStats}
          />
          <StatsCard
            title="En Línea"
            value={stats.onlineSubusers}
            icon={<UserPlusIcon className="w-6 h-6" />}
            color="success"
            loading={loadingStats}
          />
          <StatsCard
            title="Administrativos"
            value={stats.administrativos}
            icon={<UsersIcon className="w-6 h-6" />}
            color="purple"
            loading={loadingStats}
          />
          <StatsCard
            title="Trabajadores"
            value={stats.trabajadores}
            icon={<UsersIcon className="w-6 h-6" />}
            color="green"
            loading={loadingStats}
          />
        </div>


        {/* Table */}
        <EnhancedTable
          data={safeData}
          columns={columns}
          loading={loading}
          onEdit={handleEditSubuser}
          onDelete={handleDeleteSubuser}
          onResetPassword={handleResetPasswordClick}
          onEditPermissions={handleOpenPermisos}
          onRefresh={handleRefresh}
          exportFilename="subusuarios"
          exportTitle="Reporte de Subusuarios"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, newPageSize) => {
              setCurrentPage(page)
              if (newPageSize != null) setPageSize(newPageSize)
            },
          }}
          customFilters={[
            {
              key: 'rol',
              label: 'Rol',
              type: 'select',
              options: [
                { value: '', label: 'Todos los roles' },
                { value: 'administrativo', label: 'Administrativo' },
                { value: 'trabajador', label: 'Trabajador' }
              ]
            },
            {
              key: 'isOnline',
              label: 'Estado',
              type: 'select',
              options: [
                { value: '', label: 'Todos los estados' },
                { value: 'true', label: 'En línea' },
                { value: 'false', label: 'Desconectado' }
              ]
            }
          ]}
        />

        {/* Modals */}
        <SubuserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          subuser={selectedSubuser}
          mode={modalMode}
          loading={modalLoading}
        />

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setSubuserToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar Subusuario"
          message={`¿Estás seguro de que quieres eliminar a ${subuserToDelete?.fullName}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />

        <ConfirmModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onConfirm={confirmRefreshPasswords}
          title="Actualizar Contraseñas"
          message="¿Estás seguro de que quieres actualizar todas las contraseñas temporales? Esto generará nuevas contraseñas para todos los subusuarios."
          confirmText="Actualizar"
          cancelText="Cancelar"
          loading={passwordLoading}
          variant="warning"
        />

        {/* Modal contraseña temporal tras crear */}
        {tempPasswordModal && (
          <Modal
            isOpen={true}
            onClose={() => setTempPasswordModal(null)}
            title="Contraseña temporal generada"
            size="md"
          >
            <div className="p-4 space-y-4">
              <p className="text-gray-600">
                Para <strong>{tempPasswordModal.fullName}</strong> se generó esta contraseña temporal. Compártela de forma segura; el subusuario deberá cambiarla en su primer inicio de sesión.
              </p>
              <div className="flex items-stretch gap-3">
                <code className="flex-1 min-w-0 px-3 py-3 bg-gray-100 rounded-lg border border-gray-200 font-mono text-sm break-all">
                  {tempPasswordModal.password}
                </code>
                <Button
                  variant="primary"
                  size="md"
                  onClick={copyTempPassword}
                  className="shrink-0 flex items-center gap-2"
                  title="Copiar al portapapeles"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  Copiar
                </Button>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="secondary" onClick={() => setTempPasswordModal(null)}>
                  Entendido
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal permisos (todos los módulos) */}
        {subuserForPermisos && (
          <Modal
            isOpen={true}
            onClose={() => setSubuserForPermisos(null)}
            title={`Permisos de ${subuserForPermisos.fullName}`}
            size="lg"
          >
            <div className="p-4 space-y-4">
              <p className="text-gray-600 text-sm">
                Asigna permisos por módulo. <strong>Lectura</strong>: ver datos. <strong>Escritura</strong>: crear, editar y eliminar.
              </p>
              {permisosMapLoading ? (
                <div className="py-8 text-center text-gray-500">Cargando permisos…</div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Módulo
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Lectura
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Escritura
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {MODULOS_PERMISOS.map((mod) => (
                        <tr key={mod.key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {mod.label}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={(permisosMap[mod.key] ?? []).includes('read')}
                              onChange={() => togglePermisoModulo(mod.key, 'read')}
                              disabled={permisosModalLoading}
                              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={(permisosMap[mod.key] ?? []).includes('write')}
                              onChange={() => togglePermisoModulo(mod.key, 'write')}
                              disabled={permisosModalLoading}
                              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setSubuserForPermisos(null)}
                  disabled={permisosModalLoading || permisosMapLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSavePermisos}
                  loading={permisosModalLoading}
                  disabled={permisosMapLoading}
                >
                  Guardar permisos
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal cambiar contraseña de un subusuario */}
        {resetPasswordSubuser && (
          <Modal
            isOpen={true}
            onClose={() => { setResetPasswordSubuser(null); setResetPasswordValue('') }}
            title="Cambiar contraseña"
            size="md"
          >
            <div className="p-4 space-y-4">
              <p className="text-gray-600">
                Nueva contraseña para <strong>{resetPasswordSubuser.fullName}</strong> (mín. 8 caracteres, con mayúscula, minúscula, número y símbolo).
              </p>
              <Input
                label="Nueva contraseña"
                type="password"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                placeholder="••••••••"
                disabled={resetPasswordLoading}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => { setResetPasswordSubuser(null); setResetPasswordValue('') }}
                  disabled={resetPasswordLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmResetPassword}
                  loading={resetPasswordLoading}
                  disabled={resetPasswordValue.length < 8}
                >
                  Actualizar contraseña
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function TeamPage() {
  return (
    <ProtectedRoute>
      <TeamContent />
    </ProtectedRoute>
  )
}
