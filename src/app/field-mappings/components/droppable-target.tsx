"use client"

import { useDrop } from 'react-dnd'
import { memo } from 'react'

interface DroppableTargetProps {
  onDrop: (item: any) => void
  currentValue?: string
}

export const DroppableTarget = memo(function DroppableTarget({ 
  onDrop, 
  currentValue 
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
      className={`h-12 p-2 rounded-md border-2 border-dashed flex items-center
        ${isOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600'}
        ${currentValue 
          ? 'bg-white dark:bg-gray-800' 
          : 'bg-gray-50 dark:bg-gray-900'}
      `}
    >
      <span className="truncate">
        {currentValue || 'Drop field here'}
      </span>
    </div>
  )
}) 