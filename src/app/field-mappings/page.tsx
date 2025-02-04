"use client"

import { useFieldMappingInstance, useIntegrationApp } from "@integration-app/react"
import { FieldMappingTable } from "./components/field-mapping-table"
import { FieldSelector } from "./components/field-selector"
import { ArrowRight } from "lucide-react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"

const STORAGE_KEY = 'field-mapping-selected-fields'

export default function FieldMappingPage() {
  const integrationApp = useIntegrationApp()
  const { fieldMappingInstance, loading, error } = useFieldMappingInstance({
    integrationKey: "hubspot",
    fieldMappingKey: "contacts",
    autoCreate: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const isInitialized = useRef(false)

  // Load saved fields from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFields = localStorage.getItem(STORAGE_KEY)
      if (savedFields) {
        setSelectedFields(JSON.parse(savedFields))
        isInitialized.current = true
      }
    }
  }, [])

  // Initialize with all fields if no saved selection exists
  useEffect(() => {
    if (fieldMappingInstance && !isInitialized.current) {
      const allFields = Object.keys(fieldMappingInstance.externalSchema.properties || {})
      setSelectedFields(allFields)
      isInitialized.current = true
    }
  }, [fieldMappingInstance])

  // Save selected fields to localStorage whenever they change
  const handleFieldsChange = useCallback((fields: string[]) => {
    setSelectedFields(fields)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
    }
  }, [])

  const handleFieldUpdate = useCallback(async (appFieldValue: any, hubspotField: any) => {
    if (!fieldMappingInstance) return

    try {
      setIsSaving(true)
      
      // First, get the current field mapping state
      const currentMapping = await integrationApp
        .connection('hubspot')
        .fieldMapping('contacts')
        .get()

      // Update only the changed field while keeping all other values
      await integrationApp
        .connection('hubspot')
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
    } finally {
      setIsSaving(false)
    }
  }, [fieldMappingInstance, integrationApp])

  const tableProps = useMemo(() => ({
    fieldMappingInstance: fieldMappingInstance || null,
    onFieldUpdate: handleFieldUpdate,
    isLoading: loading || isSaving,
    selectedFields,
  }), [fieldMappingInstance, handleFieldUpdate, loading, isSaving, selectedFields])

  const selectorProps = useMemo(() => ({
    schema: fieldMappingInstance?.externalSchema,
    onFieldsChange: handleFieldsChange,
    selectedFields,
  }), [fieldMappingInstance?.externalSchema, handleFieldsChange, selectedFields])

  if (error?.message?.includes("No connection found")) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No Connection Found</h2>
        <p className="text-muted-foreground mb-4">
          Please connect to an app before configuring field mappings.
        </p>
        <Link 
          href="/connections" 
          className="inline-flex items-center text-primary hover:underline"
        >
          Go to Connections <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          Error loading field mappings. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Field Mappings</h1>
          <p className="text-muted-foreground">
            Configure how fields are mapped between systems
          </p>
        </div>
        {fieldMappingInstance && !loading && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Fields to Map</h2>
            <FieldSelector {...selectorProps} />
          </div>
        )}
        <div className="">
          <FieldMappingTable {...tableProps} />
        </div>
      </div>
    </div>
  )
}
