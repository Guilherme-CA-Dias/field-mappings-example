"use client"

import { useDrag } from 'react-dnd'
import { memo } from 'react'

interface DraggableFieldProps {
  name: string
  value: any
}

export const DraggableField = memo(function DraggableField({ name, value }: DraggableFieldProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',
    item: { name, value },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`px-3 py-2 rounded-md text-sm cursor-move
        bg-blue-50 dark:bg-blue-900/20 
        hover:bg-blue-100 dark:hover:bg-blue-900/30
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        transition-colors duration-200`}
    >
      {name}
    </div>
  )
}) 