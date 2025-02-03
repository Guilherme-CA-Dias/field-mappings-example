"use client"

import { DataSchema } from "@integration-app/sdk"
import { Search } from "lucide-react"
import { useState, memo } from "react"

interface FieldSelectorProps {
  schema: DataSchema
  onFieldsChange: (fields: string[]) => void
  selectedFields: string[]
}

export const FieldSelector = memo(function FieldSelector({
  schema,
  onFieldsChange,
  selectedFields,
}: FieldSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Get fields with their locators
  const fields = Object.entries(schema.properties || {}).map(([locator, prop]) => ({
    locator,
    name: prop.title || locator
  }))

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = () => {
    const newFields = fields.map(f => f.locator)
    onFieldsChange(newFields)
  }

  const handleRemoveAll = () => {
    onFieldsChange([])
  }

  const toggleField = (fieldLocator: string) => {
    const newFields = selectedFields.includes(fieldLocator)
      ? selectedFields.filter(f => f !== fieldLocator)
      : [...selectedFields, fieldLocator]
    onFieldsChange(newFields)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search fields..."
            className="w-full pl-8 pr-4 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Select All
          </button>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <button
            onClick={handleRemoveAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Remove All
          </button>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedFields.length} selected
          </span>
        </div>
      </div>
      <div className="flex flex-col max-h-[300px] overflow-y-auto p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {filteredFields.map((field) => (
          <div
            key={field.locator}
            className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
              selectedFields.includes(field.locator)
                ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => toggleField(field.locator)}
          >
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={selectedFields.includes(field.locator)}
                onChange={() => toggleField(field.locator)}
                className="rounded border-gray-300 dark:border-gray-600 
                  text-blue-600 dark:text-blue-400
                  focus:ring-blue-500 dark:focus:ring-blue-400
                  bg-white dark:bg-gray-700"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100" title={field.name}>
                {field.name}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}) 