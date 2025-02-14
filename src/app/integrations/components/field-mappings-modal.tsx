"use client"

import { Modal } from "@/components/ui/modal"
import { FieldMappingTable } from "@/app/field-mappings/components/field-mapping-table"
import { FieldSelector } from "@/app/field-mappings/components/field-selector"
import { useFieldMappingInstance, useIntegrationApp } from "@integration-app/react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = 'field-mapping-selected-fields'

interface FieldMappingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationKey: string
  integrationName: string
}

export function FieldMappingsModal({
  open,
  onOpenChange,
  integrationKey,
  integrationName
}: FieldMappingsModalProps) {
  const integrationApp = useIntegrationApp()
  const { fieldMappingInstance, loading, error } = useFieldMappingInstance({
    integrationKey,
    fieldMappingKey: "contacts",
    autoCreate: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const isInitialized = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFields = localStorage.getItem(STORAGE_KEY)
      if (savedFields) {
        setSelectedFields(JSON.parse(savedFields))
        isInitialized.current = true
      }
    }
  }, [])

  useEffect(() => {
    if (fieldMappingInstance && !isInitialized.current) {
      const allFields = Object.keys(fieldMappingInstance.externalSchema.properties || {})
      setSelectedFields(allFields)
      isInitialized.current = true
    }
  }, [fieldMappingInstance])

  const handleFieldsChange = useCallback((fields: string[]) => {
    setSelectedFields(fields)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
    }
  }, [])

  const handleFieldUpdate = useCallback(async (appFieldValue: any, hubspotField: any) => {
    if (!fieldMappingInstance) return

    try {
      const currentMapping = await integrationApp
        .connection(integrationKey)
        .fieldMapping('contacts')
        .get()

      await integrationApp
        .connection(integrationKey)
        .fieldMapping('contacts')
        .put({ 
          ...currentMapping,
          exportValue: {
            ...currentMapping.exportValue,
            [hubspotField.locator]: appFieldValue
          }
        })

    } catch (error) {
      console.error("Failed to update field mapping:", error)
    }
  }, [fieldMappingInstance, integrationApp, integrationKey])

  const handleOpenConfiguration = async () => {
    try {
      await integrationApp
        .connection(integrationKey)
        .fieldMapping('contacts')
        .openConfiguration()
    } catch (error) {
      console.error("Failed to open configuration:", error)
    }
  }

  const tableProps = useMemo(() => ({
    fieldMappingInstance: fieldMappingInstance || null,
    onFieldUpdate: handleFieldUpdate,
    isLoading: loading,
    selectedFields,
    integrationName
  }), [fieldMappingInstance, handleFieldUpdate, loading, selectedFields, integrationName])

  const selectorProps = useMemo(() => ({
    schema: fieldMappingInstance?.externalSchema,
    onFieldsChange: handleFieldsChange,
    selectedFields,
  }), [fieldMappingInstance?.externalSchema, handleFieldsChange, selectedFields])

  return (
    <Modal 
      open={open} 
      onClose={() => onOpenChange(false)}
      className="max-w-[90vw] xl:max-w-7xl h-[85vh] flex flex-col"
    >
      <div className="flex justify-between items-start p-8 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Field Mappings</h2>
          <p className="text-muted-foreground mt-1">
            Configure how fields are mapped between systems
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleOpenConfiguration}
            variant="outline"
            className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 flex items-center"
          >
            <Settings className="h-4 w-4" />
            Configure Mapping using IntegrationApp modal
          </Button>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="space-y-8">
          {fieldMappingInstance && !loading && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Fields to Map</h3>
              <FieldSelector {...selectorProps} />
            </div>
          )}
          <div className="mt-6">
            <FieldMappingTable {...tableProps} />
          </div>
        </div>
      </div>
    </Modal>
  )
} 