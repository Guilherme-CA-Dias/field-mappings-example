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

// Update the format function to handle more cases and be more concise
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

const FieldRow = memo(function FieldRow({
  field,
  exportForm,
  currentMapping,
  onSelectChange,
  selectedValue,
}: {
  field: any
  exportForm: DataForm
  currentMapping: any
  onSelectChange: (field: any, value: string) => void
  selectedValue: any
}) {
  const options = useMemo(() => 
    exportForm.getFieldValueOptions(field),
    [exportForm, field]
  )

  const currentOption = useMemo(() => 
    options.find(opt => JSON.stringify(opt.value) === JSON.stringify(selectedValue)),
    [options, selectedValue]
  )

  return (
    <TableRow>
      <TableCell className="font-medium">{field.name}</TableCell>
      <TableCell>
        <select
          className="w-[280px] rounded-md border border-input 
            dark:bg-background dark:text-foreground 
            bg-white text-black
            px-3 py-2 text-sm ring-offset-background 
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50 
            [&>option]:dark:bg-background [&>option]:dark:text-foreground
            [&>option]:bg-white [&>option]:text-black"
          onChange={(e) => onSelectChange(field, e.target.value)}
          value={currentOption?.name || ''}
        >
          <option value="">
            {currentMapping ? formatMappingExpression(currentMapping) : 'Select an App field'}
          </option>
          {options.map((option, idx) => (
            <option 
              key={`${field.locator}-${idx}`}
              value={option.name}
            >
              {option.name}
            </option>
          ))}
        </select>
      </TableCell>
    </TableRow>
  )
})

export const FieldMappingTable = memo(function FieldMappingTable({
  fieldMappingInstance,
  onFieldUpdate,
  isLoading = false,
  selectedFields,
}: FieldMappingTableProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, any>>({})

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

  useEffect(() => {
    if (exportForm) {
      const initialValues: Record<string, any> = {}
      fields.forEach(field => {
        const options = exportForm.getFieldValueOptions(field)
        const selectedOption = options.find(opt => opt.selected)
        if (selectedOption) {
          initialValues[field.locator] = selectedOption.value
        }
      })
      setSelectedValues(initialValues)
    }
  }, [exportForm, fields])

  const handleSelectChange = useCallback((field: any, optionValue: string) => {
    if (!exportForm) return
    const options = exportForm.getFieldValueOptions(field)
    const selectedOption = options.find(opt => opt.name === optionValue)
    
    if (selectedOption) {
      setSelectedValues(prev => ({
        ...prev,
        [field.locator]: selectedOption.value
      }))
      onFieldUpdate(selectedOption.value, field)
    }
  }, [exportForm, onFieldUpdate])

  if (isLoading || !fieldMappingInstance || !exportForm) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>HubSpot Field</TableHead>
              <TableHead>Mapping</TableHead>
            </TableRow>
          </TableHeader>
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
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>HubSpot Field</TableHead>
            <TableHead>Mapping</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFields.map((field) => (
            <FieldRow
              key={field.locator}
              field={field}
              exportForm={exportForm}
              currentMapping={fieldMappingInstance.exportValue[field.locator]}
              onSelectChange={handleSelectChange}
              selectedValue={selectedValues[field.locator]}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}) 