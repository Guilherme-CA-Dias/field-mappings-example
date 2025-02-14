"use client"

import { useIntegrationApp } from "@integration-app/react"
import { CommunicationForm } from "./components/communication-form"
import { WhatsAppForm } from "./components/whatsapp-form"
import { ContactsList } from "./components/contacts-list"
import { useEffect, useState } from "react"
import { DataForm } from "@integration-app/sdk"
import { PhoneContext } from "./components/phone-context"

export default function CommunicationPage() {
  const [fields, setFields] = useState<Array<{ name: string; value: any }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const integrationApp = useIntegrationApp()
  const [phoneNumber, setPhoneNumber] = useState("")

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
    <PhoneContext.Provider value={{ setPhoneNumber }}>
      <div className="container py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-8">Communication</h1>
        
        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-800 gap-8 mb-12">
          <div className="space-y-6 pr-8">
            <div>
              <h2 className="text-lg font-semibold mb-2">Push to CRM</h2>
              <p className="text-muted-foreground">
                Send information to your connected CRM system
              </p>
            </div>

            <CommunicationForm fields={fields} isLoading={isLoading} />
          </div>

          <div className="space-y-6 pl-8">
            <div>
              <h2 className="text-lg font-semibold mb-2">Send WhatsApp Message</h2>
              <p className="text-muted-foreground">
                Send a direct message via WhatsApp
              </p>
            </div>

            <div id="whatsapp-form">
              <WhatsAppForm initialPhone={phoneNumber} />
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <ContactsList />
        </div>
      </div>
    </PhoneContext.Provider>
  )
} 