"use client"

import { useDrag } from 'react-dnd'
import { memo } from 'react'

interface DraggableFieldProps {
  name: string  // Display name of the field (e.g., "First Name")
  value: any    // Value/key of the field (e.g., "firstName")
}

/**
 * A draggable field component used in the field mapping interface.
 * Uses react-dnd for drag and drop functionality.
 * 
 * @param name - The display name of the field to show in the UI
 * @param value - The actual field value/key used for mapping
 */
export const DraggableField = memo(function DraggableField({ name, value }: DraggableFieldProps) {
  // Set up drag functionality with react-dnd
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',  // Identifier used by drop targets to recognize valid draggables
    item: { name, value },  // Data passed to the drop target when dropped
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),  // Used for visual feedback during drag
    }),
  }))

  return (
    <div
      ref={drag}  // Attach drag ref to make element draggable
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