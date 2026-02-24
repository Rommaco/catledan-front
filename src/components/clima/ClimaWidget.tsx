'use client'
import React, { useState, useEffect } from 'react'
import { CloudIcon, SunIcon, BoltIcon } from '@heroicons/react/24/outline'
import { climaService, type ClimaData } from '@/lib/clima/climaService'

export function ClimaWidget() {
  const [clima, setClima] = useState<ClimaData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    climaService.get().then((data) => {
      if (!cancelled) {
        setClima(data ?? null)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 min-w-[140px]">
        <CloudIcon className="w-5 h-5 animate-pulse" />
        <span className="text-sm">Cargando...</span>
      </div>
    )
  }

  const temp = clima?.temperatura
  const desc = clima?.descripcion ?? (temp != null && temp > 28 ? 'Soleado' : temp != null && temp > 20 ? 'Parcialmente nublado' : temp != null ? 'Nublado' : 'Sin datos')
  const city = clima?.ciudad ?? 'Lima'

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 text-sky-800 shadow-sm"
      title={`Clima en ${city}`}
    >
      {temp >= 28 ? (
        <SunIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
      ) : temp >= 20 ? (
        <CloudIcon className="w-5 h-5 text-sky-500 flex-shrink-0" />
      ) : (
        <BoltIcon className="w-5 h-5 text-sky-600 flex-shrink-0" />
      )}
      <span className="text-sm font-semibold tabular-nums">{temp != null && !Number.isNaN(temp) ? `${Math.round(temp)}°C` : '--°C'}</span>
      <span className="text-xs text-sky-600 truncate max-w-[100px] hidden sm:inline">{desc}</span>
      <span className="text-xs text-sky-500 hidden md:inline">· {city}</span>
    </div>
  )
}
