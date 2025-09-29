'use client'
import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface PieChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  title?: string
  className?: string
  animate?: boolean
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
]

export const CustomPieChart: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey,
  title,
  className,
  animate = true,
  colors = DEFAULT_COLORS
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            className="hover:opacity-80 transition-opacity duration-200"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '14px'
            }}
            labelStyle={{ color: '#1e293b', fontWeight: '600' }}
            formatter={(value: any, name: any) => [value, nameKey]}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px',
              color: '#64748b'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

CustomPieChart.displayName = 'CustomPieChart'
