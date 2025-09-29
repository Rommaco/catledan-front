'use client'
import React, { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabItem {
  key: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  defaultActiveKey?: string
  activeKey?: string
  onChange?: (key: string) => void
  className?: string
  children?: ReactNode
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  className,
  children,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(
    activeKey || defaultActiveKey || items[0]?.key || ''
  )

  const currentActiveKey = activeKey || internalActiveKey

  const handleTabClick = (key: string) => {
    if (onChange) {
      onChange(key)
    } else {
      setInternalActiveKey(key)
    }
  }

  // Filtrar solo el contenido de la pestaña activa
  const activeTabContent = React.Children.toArray(children).find((child) => {
    if (React.isValidElement(child) && child.props.tabKey === currentActiveKey) {
      return child
    }
    return null
  })

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => !item.disabled && handleTabClick(item.key)}
              disabled={item.disabled}
              className={cn(
                'group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                currentActiveKey === item.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon && (
                <span className={cn(
                  'mr-2',
                  currentActiveKey === item.key ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                )}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - Solo mostrar la pestaña activa */}
      <div className="mt-6">
        {activeTabContent}
      </div>
    </div>
  )
}

interface TabPaneProps {
  tabKey: string
  children: ReactNode
  className?: string
}

export const TabPane: React.FC<TabPaneProps> = ({ tabKey, children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  )
}
