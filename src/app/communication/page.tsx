"use client"

import { useIntegrationApp } from "@integration-app/react"
import { CommunicationForm } from "./components/communication-form"
import { useEffect, useState } from "react"
import { DataForm } from "@integration-app/sdk"

export default function CommunicationPage() {
  const [fields, setFields] = useState<Array<{ name: string; value: any }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const integrationApp = useIntegrationApp()

  useEffect(() => {
    async function loadFields() {
      try {
        const fieldMapping = await integrationApp
          .connection("hubspot")
          .fieldMapping("contacts")
          .get()

        // Create a DataForm instance to get available fields
        const exportForm = new DataForm({
          schema: fieldMapping.externalSchema,
          value: fieldMapping.exportValue,
          variablesSchema: fieldMapping.appSchema,
        })

        // Get the first field to access available options
        const firstField = exportForm.getFields()[0]
        if (!firstField) return

        // Get the available fields (same as in the modal)
        const availableFields = exportForm.getFieldValueOptions(firstField)
          .map(option => ({
            name: option.name,
            value: option.value
          }))

        setFields(availableFields)
      } catch (error) {
        console.error("Failed to load fields:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFields()
  }, [integrationApp])

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communication</h1>
          <p className="text-muted-foreground mt-2">
            Send information to your connected CRM system
          </p>
        </div>

        <CommunicationForm fields={fields} isLoading={isLoading} />
      </div>
    </div>
  )
} 