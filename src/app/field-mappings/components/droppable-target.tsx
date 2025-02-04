"use client"

import { useDrop } from 'react-dnd'
import { memo } from 'react'

interface DroppableTargetProps {
  onDrop: (item: any) => void
  currentValue?: string
  isUpdating?: boolean
}

export const DroppableTarget = memo(function DroppableTarget({ 
  onDrop, 
  currentValue,
  isUpdating 
}: DroppableTargetProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FIELD',
    drop: (item) => {
      onDrop(item)
      return undefined
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDrop])

  return (
    <div
      ref={drop}
      className="min-h-[48px] rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 p-2.5"
    >
      <div
        className={`inline-flex items-center h-10 px-3 py-2 rounded-md
          ${isOver 
            ? 'bg-blue-100 dark:bg-blue-900/30' 
            : currentValue 
              ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
              : 'bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
          transition-colors duration-200
        `}
      >
        <span className="truncate text-sm">
          {currentValue || 'Drop field here'}
        </span>
      </div>
    </div>
  )
}) 