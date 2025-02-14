"use client"

import { useIntegrationApp, useIntegrations } from "@integration-app/react"
import type { Integration as IntegrationAppIntegration } from "@integration-app/sdk"
import { FieldMappingsModal } from "./field-mappings-modal"
import { Settings } from "lucide-react"
import { useState } from "react"

export function IntegrationList() {
  const integrationApp = useIntegrationApp()
  const { integrations, refresh } = useIntegrations()
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [selectedIntegrationName, setSelectedIntegrationName] = useState<string | null>(null)
  const [isFieldMappingsOpen, setIsFieldMappingsOpen] = useState(false)

  const handleConnect = async (integration: IntegrationAppIntegration) => {
    try {
      await integrationApp.integration(integration.key).openNewConnection()
      refresh()
    } catch (error) {
      console.error("Failed to connect:", error)
    }
  }

  const handleDisconnect = async (integration: IntegrationAppIntegration) => {
    if (!integration.connection?.id) return
    try {
      await integrationApp.connection(integration.connection.id).archive()
      refresh()
    } catch (error) {
      console.error("Failed to disconnect:", error)
    }
  }

  return (
    <ul className="space-y-4 mt-8">
      {integrations.map((integration) => (
        <li
          key={integration.key}
          className="group flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div className="flex-shrink-0">
            {integration.logoUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={integration.logoUri}
                alt={`${integration.name} logo`}
                className="w-10 h-10 rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300">
                {integration.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {integration.name}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {integration.connection && integration.key !== 'whatsapp' && (
              <button
                onClick={() => {
                  setSelectedIntegration(integration.key)
                  setSelectedIntegrationName(integration.name)
                  setIsFieldMappingsOpen(true)
                }}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 flex items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                Field Mappings
              </button>
            )}
            <button
              onClick={() =>
                integration.connection
                  ? handleDisconnect(integration)
                  : handleConnect(integration)
              }
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                integration.connection
                  ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100 hover:bg-red-200 hover:text-red-800 dark:hover:bg-red-800 dark:hover:text-red-100"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-700 dark:hover:text-blue-100"
              }`}
            >
              {integration.connection ? "Disconnect" : "Connect"}
            </button>
          </div>
        </li>
      ))}

      {selectedIntegration && (
        <FieldMappingsModal
          open={isFieldMappingsOpen}
          onOpenChange={setIsFieldMappingsOpen}
          integrationKey={selectedIntegration}
          integrationName={selectedIntegrationName}
        />
      )}
    </ul>
  )
}
