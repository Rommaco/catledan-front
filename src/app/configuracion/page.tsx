'use client'
import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Tabs, TabPane } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Switch } from '@/components/ui/Switch'
import { useConfiguracion } from '@/hooks/configuracion/useConfiguracion'
import { useToast } from '@/hooks/useToast'
import {
  ConfiguracionEmpresa,
  ConfiguracionUsuario,
  ConfiguracionSistema,
  IDIOMAS,
  ZONAS_HORARIAS,
  FORMATOS_FECHA,
  MONEDAS,
  ROLES,
} from '@/types/configuracion'
import {
  BuildingOfficeIcon,
  UserIcon,
  CogIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

function ConfiguracionContent() {
  const {
    configuracion,
    loading,
    error,
    updateEmpresa,
    updateUsuario,
    updateSistema,
    refreshConfiguracion,
  } = useConfiguracion()

  const { toast } = useToast()

  // Estados para los formularios
  const [empresaForm, setEmpresaForm] = useState<ConfiguracionEmpresa>({
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    email: '',
    sitioWeb: '',
    descripcion: '',
  })

  const [usuarioForm, setUsuarioForm] = useState<ConfiguracionUsuario>({
    nombre: '',
    email: '',
    telefono: '',
    rol: 'admin',
    avatar: '',
  })

  const [sistemaForm, setSistemaForm] = useState<ConfiguracionSistema>({
    idioma: 'es',
    zonaHoraria: 'America/Mexico_City',
    formatoFecha: 'DD/MM/YYYY',
    moneda: 'MXN',
    notificaciones: {
      email: true,
      push: true,
      recordatoriosVacunacion: true,
      alertasPeso: true,
      reportesAutomaticos: false,
    },
  })

  // Estados de carga para cada sección
  const [empresaLoading, setEmpresaLoading] = useState(false)
  const [usuarioLoading, setUsuarioLoading] = useState(false)
  const [sistemaLoading, setSistemaLoading] = useState(false)

  // Actualizar formularios cuando cambie la configuración
  useEffect(() => {
    if (configuracion) {
      setEmpresaForm(configuracion.empresa)
      setUsuarioForm(configuracion.usuario)
      setSistemaForm(configuracion.sistema)
    }
  }, [configuracion])

  const handleEmpresaChange = (field: keyof ConfiguracionEmpresa, value: string) => {
    setEmpresaForm(prev => ({ ...prev, [field]: value }))
  }

  const handleUsuarioChange = (field: keyof ConfiguracionUsuario, value: string) => {
    setUsuarioForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSistemaChange = (field: keyof ConfiguracionSistema, value: any) => {
    setSistemaForm(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificacionChange = (field: keyof ConfiguracionSistema['notificaciones'], value: boolean) => {
    setSistemaForm(prev => ({
      ...prev,
      notificaciones: {
        ...prev.notificaciones,
        [field]: value,
      },
    }))
  }

  const handleSaveEmpresa = async () => {
    try {
      setEmpresaLoading(true)
      await updateEmpresa(empresaForm)
    } catch (error) {
      console.error('Error al guardar empresa:', error)
    } finally {
      setEmpresaLoading(false)
    }
  }

  const handleSaveUsuario = async () => {
    try {
      setUsuarioLoading(true)
      await updateUsuario(usuarioForm)
    } catch (error) {
      console.error('Error al guardar usuario:', error)
    } finally {
      setUsuarioLoading(false)
    }
  }

  const handleSaveSistema = async () => {
    try {
      setSistemaLoading(true)
      await updateSistema(sistemaForm)
    } catch (error) {
      console.error('Error al guardar sistema:', error)
    } finally {
      setSistemaLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      await refreshConfiguracion()
      toast({
        type: 'success',
        title: 'Actualizado',
        message: 'Configuración actualizada correctamente.',
      })
    } catch (error) {
      console.error('Error al actualizar:', error)
    }
  }

  const tabs = [
    {
      key: 'empresa',
      label: 'Empresa',
      icon: <BuildingOfficeIcon className="w-4 h-4" />,
    },
    {
      key: 'usuario',
      label: 'Usuario',
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      key: 'sistema',
      label: 'Sistema',
      icon: <CogIcon className="w-4 h-4" />,
    },
  ]

  if (error && !configuracion) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Error al cargar la configuración</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Gestiona la configuración de tu cuenta y sistema</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="lg"
              loading={loading}
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs items={tabs} defaultActiveKey="empresa">
          {/* Tab Empresa */}
          <TabPane tabKey="empresa">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Información de la Empresa</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre de la Empresa"
                    value={empresaForm.nombre}
                    onChange={(e) => handleEmpresaChange('nombre', e.target.value)}
                    disabled={empresaLoading}
                    placeholder="Ingresa el nombre de tu empresa"
                  />

                  <Input
                    label="RFC"
                    value={empresaForm.rfc}
                    onChange={(e) => handleEmpresaChange('rfc', e.target.value)}
                    disabled={empresaLoading}
                    placeholder="RFC de la empresa"
                  />

                  <Input
                    label="Dirección"
                    value={empresaForm.direccion}
                    onChange={(e) => handleEmpresaChange('direccion', e.target.value)}
                    disabled={empresaLoading}
                    placeholder="Dirección completa"
                  />

                  <Input
                    label="Teléfono"
                    value={empresaForm.telefono}
                    onChange={(e) => handleEmpresaChange('telefono', e.target.value)}
                    disabled={empresaLoading}
                    placeholder="Número de teléfono"
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={empresaForm.email}
                    onChange={(e) => handleEmpresaChange('email', e.target.value)}
                    disabled={empresaLoading}
                    placeholder="correo@empresa.com"
                  />

                  <Input
                    label="Sitio Web"
                    value={empresaForm.sitioWeb}
                    onChange={(e) => handleEmpresaChange('sitioWeb', e.target.value)}
                    disabled={empresaLoading}
                    placeholder="https://www.empresa.com"
                  />
                </div>

                <Input
                  label="Descripción"
                  value={empresaForm.descripcion}
                  onChange={(e) => handleEmpresaChange('descripcion', e.target.value)}
                  disabled={empresaLoading}
                  isTextArea
                  rows={3}
                  placeholder="Descripción de la empresa"
                />

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveEmpresa}
                    variant="primary"
                    size="lg"
                    loading={empresaLoading}
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Guardar Empresa
                  </Button>
                </div>
              </div>
            </Card>
          </TabPane>

          {/* Tab Usuario */}
          <TabPane tabKey="usuario">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Información del Usuario</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre Completo"
                    value={usuarioForm.nombre}
                    onChange={(e) => handleUsuarioChange('nombre', e.target.value)}
                    disabled={usuarioLoading}
                    placeholder="Tu nombre completo"
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={usuarioForm.email}
                    onChange={(e) => handleUsuarioChange('email', e.target.value)}
                    disabled={usuarioLoading}
                    placeholder="tu@email.com"
                  />

                  <Input
                    label="Teléfono"
                    value={usuarioForm.telefono}
                    onChange={(e) => handleUsuarioChange('telefono', e.target.value)}
                    disabled={usuarioLoading}
                    placeholder="Número de teléfono"
                  />

                  <CustomSelect
                    label="Rol"
                    options={ROLES.map(r => ({ value: r.value, label: r.label }))}
                    value={usuarioForm.rol}
                    onChange={(value) => handleUsuarioChange('rol', value)}
                    disabled={usuarioLoading}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveUsuario}
                    variant="primary"
                    size="lg"
                    loading={usuarioLoading}
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Guardar Usuario
                  </Button>
                </div>
              </div>
            </Card>
          </TabPane>

          {/* Tab Sistema */}
          <TabPane tabKey="sistema">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <CogIcon className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Configuración del Sistema</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomSelect
                    label="Idioma"
                    options={IDIOMAS.map(i => ({ value: i.value, label: i.label }))}
                    value={sistemaForm.idioma}
                    onChange={(value) => handleSistemaChange('idioma', value)}
                    disabled={sistemaLoading}
                  />

                  <CustomSelect
                    label="Zona Horaria"
                    options={ZONAS_HORARIAS.map(z => ({ value: z.value, label: z.label }))}
                    value={sistemaForm.zonaHoraria}
                    onChange={(value) => handleSistemaChange('zonaHoraria', value)}
                    disabled={sistemaLoading}
                  />

                  <CustomSelect
                    label="Formato de Fecha"
                    options={FORMATOS_FECHA.map(f => ({ value: f.value, label: f.label }))}
                    value={sistemaForm.formatoFecha}
                    onChange={(value) => handleSistemaChange('formatoFecha', value)}
                    disabled={sistemaLoading}
                  />

                  <CustomSelect
                    label="Moneda"
                    options={MONEDAS.map(m => ({ value: m.value, label: m.label }))}
                    value={sistemaForm.moneda}
                    onChange={(value) => handleSistemaChange('moneda', value)}
                    disabled={sistemaLoading}
                  />
                </div>

                {/* Notificaciones */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
                  <div className="space-y-4">
                    <Switch
                      checked={sistemaForm.notificaciones.email}
                      onChange={(checked) => handleNotificacionChange('email', checked)}
                      label="Notificaciones por Email"
                      description="Recibe notificaciones importantes por correo electrónico"
                      disabled={sistemaLoading}
                    />

                    <Switch
                      checked={sistemaForm.notificaciones.push}
                      onChange={(checked) => handleNotificacionChange('push', checked)}
                      label="Notificaciones Push"
                      description="Recibe notificaciones en tiempo real en el navegador"
                      disabled={sistemaLoading}
                    />

                    <Switch
                      checked={sistemaForm.notificaciones.recordatoriosVacunacion}
                      onChange={(checked) => handleNotificacionChange('recordatoriosVacunacion', checked)}
                      label="Recordatorios de Vacunación"
                      description="Recibe alertas sobre fechas de vacunación del ganado"
                      disabled={sistemaLoading}
                    />

                    <Switch
                      checked={sistemaForm.notificaciones.alertasPeso}
                      onChange={(checked) => handleNotificacionChange('alertasPeso', checked)}
                      label="Alertas de Peso"
                      description="Recibe notificaciones sobre cambios de peso del ganado"
                      disabled={sistemaLoading}
                    />

                    <Switch
                      checked={sistemaForm.notificaciones.reportesAutomaticos}
                      onChange={(checked) => handleNotificacionChange('reportesAutomaticos', checked)}
                      label="Reportes Automáticos"
                      description="Recibe reportes generados automáticamente"
                      disabled={sistemaLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveSistema}
                    variant="primary"
                    size="lg"
                    loading={sistemaLoading}
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Guardar Sistema
                  </Button>
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default function ConfiguracionPage() {
  return (
    <ProtectedRoute>
      <ConfiguracionContent />
    </ProtectedRoute>
  )
}
