'use client'
import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface BarChartProps {
  data: any[]
  xKey: string
  yKey: string
  color?: string
  title?: string
  className?: string
  animate?: boolean
}

export const CustomBarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  color = '#22c55e',
  title,
  className,
  animate = true
}) => {
  return (
    <div className={cn(
      'w-full h-full min-h-[300px] p-4 bg-white rounded-xl border border-gray-200 shadow-sm',
      animate && 'animate-fade-in',
      className
    )}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '14px'
            }}
            labelStyle={{ color: '#1e293b', fontWeight: '600' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px',
              color: '#64748b'
            }}
          />
          <Bar
            dataKey={yKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            className="hover:opacity-80 transition-opacity duration-200"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

CustomBarChart.displayName = 'CustomBarChart'
