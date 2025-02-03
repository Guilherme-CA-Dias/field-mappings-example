"use client"

import { DataForm, DataSchema } from "@integration-app/sdk"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect, memo, useMemo, useCallback } from "react"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DraggableField } from "./draggable-field"
import { DroppableTarget } from "./droppable-target"

interface FieldMappingInstance {
  appSchema: DataSchema
  importValue: any
  externalSchema: DataSchema
  exportValue: any
}

interface FieldOption {
  name: string
  value: any
  selected: boolean
}

interface FieldMappingTableProps {
  fieldMappingInstance: FieldMappingInstance | null
  onFieldUpdate: (appFieldValue: any, hubspotField: any) => void
  isLoading?: boolean
  selectedFields: string[]
}

// Move this outside the component to prevent recreation
const formatMappingExpression = (value: any): string => {
  if (!value) return 'Select an App field'
  
  // Handle firstName extraction
  if (value.$firstName && value.$firstName.$var) {
    return `Extract firstname from ${value.$firstName.$var.replace('$.', '')}`
  }
  
  // Handle lastName extraction
  if (value.$lastName && value.$lastName.$var) {
    return `Extract lastname from ${value.$lastName.$var.replace('$.', '')}`
  }

  // Handle direct variable mapping
  if (value.$var) {
    return value.$var.replace('$.', '')
  }

  return JSON.stringify(value)
}

// Create a separate memoized component for the table header
const TableHeaderComponent = memo(function TableHeaderComponent() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>HubSpot Field</TableHead>
        <TableHead>Mapping</TableHead>
      </TableRow>
    </TableHeader>
  )
})

// Create a more granular row component that manages its own state
const MappingRow = memo(function MappingRow({
  field,
  exportForm,
  initialMapping,
  onUpdate,
}: {
  field: any
  exportForm: DataForm
  initialMapping: any
  onUpdate: (value: any) => void
}) {
  const [currentValue, setCurrentValue] = useState(initialMapping)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const handleDrop = useCallback(async (item: any) => {
    const options = exportForm.getFieldValueOptions(field)
    const option = options.find(opt => 
      opt.name === item.name && JSON.stringify(opt.value) === JSON.stringify(item.value)
    )
    if (option) {
      setIsUpdating(true)
      setCurrentValue(option.value)
      await onUpdate(option.value)
      setIsUpdating(false)
    }
  }, [exportForm, field, onUpdate])

  const displayValue = useMemo(() => {
    const options = exportForm.getFieldValueOptions(field)
    const currentOption = options.find(opt => 
      JSON.stringify(opt.value) === JSON.stringify(currentValue)
    )
    return currentOption?.name || formatMappingExpression(currentValue)
  }, [exportForm, field, currentValue])

  return (
    <TableRow>
      <TableCell className="font-medium">{field.name}</TableCell>
      <TableCell>
        <DroppableTarget
          onDrop={handleDrop}
          currentValue={displayValue}
          isUpdating={isUpdating}
        />
      </TableCell>
    </TableRow>
  )
})

// Create a separate memoized component for the available fields sidebar
const AvailableFieldsSidebar = memo(function AvailableFieldsSidebar({
  fields
}: {
  fields: { name: string; value: any }[]
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Available Fields</h4>
      <div className="space-y-2 p-4 rounded-md border border-gray-200 dark:border-gray-700">
        {fields.map((field, index) => (
          <DraggableField
            key={index}
            name={field.name}
            value={field.value}
          />
        ))}
      </div>
    </div>
  )
})

export const FieldMappingTable = memo(function FieldMappingTable({
  fieldMappingInstance,
  onFieldUpdate,
  isLoading = false,
  selectedFields,
}: FieldMappingTableProps) {
  const exportForm = useMemo(() => {
    if (!fieldMappingInstance) return null
    return new DataForm({
      schema: fieldMappingInstance.externalSchema,
      value: fieldMappingInstance.exportValue,
      variablesSchema: fieldMappingInstance.appSchema,
    })
  }, [fieldMappingInstance])

  const fields = useMemo(() => {
    return exportForm?.getFields() || []
  }, [exportForm])

  const filteredFields = useMemo(() => {
    return fields.filter(field => selectedFields.includes(field.locator))
  }, [fields, selectedFields])

  const handleFieldUpdate = useCallback((field: any, value: any) => {
    // Debounce the API call to prevent rapid updates
    const timeoutId = setTimeout(() => {
      onFieldUpdate(value, field)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [onFieldUpdate])

  const availableFields = useMemo(() => {
    if (!exportForm) return []
    const firstField = exportForm.getFields()[0]
    if (!firstField) return []
    
    const options = exportForm.getFieldValueOptions(firstField)
    return options.map(option => ({
      name: option.name,
      value: option.value
    }))
  }, [exportForm])

  if (isLoading || !fieldMappingInstance || !exportForm) {
    return <LoadingState />
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-[1fr,300px] gap-4">
        <div className="rounded-md border">
          <Table>
            <TableHeaderComponent />
            <TableBody>
              {filteredFields.map((field) => (
                <MappingRow
                  key={field.locator}
                  field={field}
                  exportForm={exportForm}
                  initialMapping={fieldMappingInstance.exportValue[field.locator]}
                  onUpdate={(value) => handleFieldUpdate(field, value)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <AvailableFieldsSidebar fields={availableFields} />
      </div>
    </DndProvider>
  )
})

// Separate loading state component
const LoadingState = memo(function LoadingState() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeaderComponent />
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-6 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[200px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}) 