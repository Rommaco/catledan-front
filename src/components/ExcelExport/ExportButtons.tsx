'use client'

import React from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'

interface Column {
  title: string
  dataIndex: string
  key: string
}

interface ExportButtonsProps {
  data: Record<string, unknown>[]
  columns: Column[]
  filename: string
  sheetName?: string
  title?: string
  subtitle?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  isPdfDisabled?: boolean
  excelButtonText?: string
  pdfButtonText?: string
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  columns,
  filename,
  sheetName = 'Datos',
  title = 'Reporte',
  subtitle = '',
  disabled = false,
  size = 'md',
  isPdfDisabled = false,
  excelButtonText = 'Exportar Excel',
  pdfButtonText = 'Exportar PDF',
}) => {
  const { toast } = useToast()

  const exportToExcel = () => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: 'Advertencia',
          message: 'No hay datos para exportar',
          type: 'warning'
        })
        return
      }

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
      saveAs(blob, `${filename}.xlsx`)

      toast({
        title: 'Éxito',
        message: `Archivo ${filename}.xlsx descargado exitosamente`,
        type: 'success'
      })
    } catch (error) {
      console.error('Error al exportar Excel:', error)
      toast({
        title: 'Error',
        message: 'Error al exportar el archivo Excel',
        type: 'error'
      })
    }
  }

  const exportToPdf = async () => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: 'Advertencia',
          message: 'No hay datos para exportar',
          type: 'warning'
        })
        return
      }

      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()

      const drawHeader = () => {
        // Fondo con color de la empresa (Verde Agro)
        pdf.setFillColor(34, 197, 94) // Verde Agro
        pdf.rect(0, 0, pageW, 25, 'F')

        // Título de la empresa
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(20)
        pdf.setTextColor(255, 255, 255)
        pdf.text('Catledan SaaS', 15, 17)

        // Lema
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        pdf.setTextColor(220, 220, 220)
        pdf.text('Sistema de Gestión Ganadera', pageW - 75, 17)
      }

      const drawFooter = (pageNumber: number, totalPages: number) => {
        // Fondo con color de la empresa
        pdf.setFillColor(34, 197, 94)
        pdf.rect(0, pageH - 15, pageW, 15, 'F')

        // Información
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(220, 220, 220)
        pdf.text('Reporte generado por Catledan SaaS', 15, pageH - 8)
        pdf.text(`Página ${pageNumber} de ${totalPages}`, pageW - 35, pageH - 8)
      }

      drawHeader()

      // Título principal del reporte
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.setTextColor(40, 40, 40)
      pdf.text(title, 15, 40)

      // Información de generación
      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      const fecha = new Date().toLocaleDateString('es-ES')
      const hora = new Date().toLocaleTimeString('es-ES')
      pdf.text(`Generado el ${fecha} a las ${hora}`, 15, 47)
      pdf.text(`Total de registros: ${data.length}`, 15, 52)

      const exportColumns = columns.filter(column =>
        column.dataIndex && column.title && column.key !== 'actions'
      )

      let currentY = 65
      const margin = 15
      const cardWidth = pageW - (margin * 2)
      const cardHeight = 35
      const columnWidth = (cardWidth - 20) / 3
      const columnSpacing = 10

      const truncateText = (text: string, maxWidth: number): string => {
        const textWidth = pdf.getTextWidth(text)
        if (textWidth <= maxWidth) return text
        
        let truncated = text
        while (pdf.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1)
        }
        return truncated + (truncated.length < text.length ? '...' : '')
      }

      // Layout de tarjetas
      data.forEach((item, index) => {
        const numLayoutColumns = 3
        const numLayoutRows = Math.ceil(exportColumns.length / numLayoutColumns)
        const calculatedCardHeight = Math.max(cardHeight, 15 + (numLayoutRows * 7))

        // Verificar si necesitamos nueva página
        if (currentY + calculatedCardHeight > pageH - 30) {
          pdf.addPage()
          drawHeader()
          currentY = 65
        }

        // Fondo de la tarjeta
        pdf.setFillColor(248, 250, 252)
        pdf.rect(margin, currentY, cardWidth, calculatedCardHeight, 'F')

        // Borde de la tarjeta
        pdf.setDrawColor(226, 232, 240)
        pdf.setLineWidth(0.5)
        pdf.rect(margin, currentY, cardWidth, calculatedCardHeight, 'S')

        // Título de la tarjeta (número de registro)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.setTextColor(34, 197, 94)
        pdf.text(`Registro #${index + 1}`, margin + 5, currentY + 8)

        const contentStartY = currentY + 12
        const lineHeight = 7

        exportColumns.forEach((column, i) => {
          const layoutColIndex = i % numLayoutColumns
          const layoutRowIndex = Math.floor(i / numLayoutColumns)

          let value = (item as Record<string, unknown>)[column.dataIndex]
          if (value instanceof Date) value = value.toLocaleDateString('es-ES')
          else if (typeof value === 'boolean') value = value ? '✅ Sí' : '❌ No'
          else if (typeof value === 'number') value = value.toLocaleString('es-ES')
          value = value || ''

          const currentX = margin + 5 + (layoutColIndex * (columnWidth + columnSpacing))
          const currentContentY = contentStartY + (layoutRowIndex * lineHeight)

          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(34, 197, 94)
          const label = `${column.title}: `
          const labelWidth = pdf.getTextWidth(label)
          const truncatedLabel = truncateText(label, columnWidth)
          pdf.text(truncatedLabel, currentX, currentContentY)

          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(40, 40, 40)
          const valueMaxWidth = columnWidth - labelWidth - 1
          const truncatedValue = truncateText(String(value), valueMaxWidth)
          pdf.text(truncatedValue, currentX + labelWidth, currentContentY)
        })

        currentY += calculatedCardHeight + 8
      })

      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        drawFooter(i, totalPages)
      }

      const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

      toast({
        title: 'Éxito',
        message: `Archivo ${fileName} descargado exitosamente`,
        type: 'success'
      })
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      toast({
        title: 'Error',
        message: 'Error al exportar el archivo PDF',
        type: 'error'
      })
    }
  }

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToExcel}
        variant="primary"
        size={buttonSize}
        disabled={disabled}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {excelButtonText}
      </Button>

      {!isPdfDisabled && (
        <Button
          onClick={exportToPdf}
          variant="primary"
          size={buttonSize}
          disabled={disabled}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {pdfButtonText}
        </Button>
      )}
    </div>
  )
}

export default ExportButtons
