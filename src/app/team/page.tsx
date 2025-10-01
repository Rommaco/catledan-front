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
import { useSubuser, useSubuserStats } from '@/hooks/subuser/useSubuser'
import { useToast } from '@/hooks/useToast'
import {
  Subuser,
  CreateSubuserData,
  UpdateSubuserData,
  ROLES_SUBUSER,
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
  } = useSubuser()

  const { stats, loadingStats, fetchStats } = useSubuserStats()
  const { toast } = useToast()

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
        await addSubuser(dataToSave as CreateSubuserData)
      } else if (selectedSubuser) {
        await updateSubuser(selectedSubuser._id, dataToSave as UpdateSubuserData)
      }
      toast({
        type: 'success',
        title: 'Éxito',
        message: `Subusuario ${modalMode === 'create' ? 'creado' : 'actualizado'} correctamente.`,
      })
      handleRefresh()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error al guardar subusuario:', error)
      toast({
        type: 'error',
        title: 'Error',
        message: `Hubo un error al ${modalMode === 'create' ? 'crear' : 'actualizar'} el subusuario.`,
      })
    } finally {
      setModalLoading(false)
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
      render: (permisos: string[]) => (
        <div className="flex flex-wrap gap-1">
          {permisos.map((permiso) => (
            <Badge
              key={permiso}
              variant="info"
              size="sm"
            >
              {permiso}
            </Badge>
          ))}
        </div>
      ),
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
          data={data || []}
          columns={columns}
          loading={loading}
          onEdit={handleEditSubuser}
          onDelete={handleDeleteSubuser}
          exportFilename="subusuarios"
          exportTitle="Reporte de Subusuarios"
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
