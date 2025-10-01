'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Subuser, CreateSubuserData, UpdateSubuserData, ROLES_SUBUSER } from '@/types/subuser'

interface SubuserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateSubuserData | UpdateSubuserData) => Promise<void>
  subuser?: Subuser | null
  mode: 'create' | 'edit'
  loading: boolean
}

export const SubuserModal: React.FC<SubuserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subuser,
  mode,
  loading,
}) => {
  const [formData, setFormData] = useState<CreateSubuserData>({
    fullName: '',
    email: '',
    rol: 'trabajador',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && subuser) {
        setFormData({
          fullName: subuser.fullName,
          email: subuser.email,
          rol: subuser.permisos.includes('administrativo') ? 'administrativo' : 'trabajador',
        })
      } else {
        setFormData({
          fullName: '',
          email: '',
          rol: 'trabajador',
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, subuser])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    await onSave(formData)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Nuevo Subusuario' : 'Editar Subusuario'} size="md">
      <div className="space-y-4 p-4">
        <Input
          label="Nombre Completo"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          disabled={loading}
          placeholder="Nombre completo del subusuario"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={loading}
          placeholder="correo@ejemplo.com"
        />

        <CustomSelect
          label="Rol"
          options={ROLES_SUBUSER.map(r => ({ value: r.value, label: r.label }))}
          value={formData.rol}
          onChange={(value) => handleSelectChange('rol', value.toString())}
          error={errors.rol}
          disabled={loading}
        />

        {mode === 'create' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Información importante
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Se generará automáticamente una contraseña temporal para el subusuario.
                    El subusuario deberá cambiar esta contraseña en su primer inicio de sesión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 px-4">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          {mode === 'create' ? 'Crear Subusuario' : 'Guardar Cambios'}
        </Button>
      </div>
    </Modal>
  )
}
