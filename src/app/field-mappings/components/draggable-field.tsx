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
      className={`p-2 rounded-md border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-800 cursor-move
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:bg-gray-50 dark:hover:bg-gray-700`}
    >
      {name}
    </div>
  )
}) 