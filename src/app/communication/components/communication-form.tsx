"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIntegrationApp } from "@integration-app/react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface CommunicationFormProps {
  fields: Array<{ name: string; value: any }>
  isLoading: boolean
}

const WEBHOOK_URL = "https://api.integration.app/webhooks/app-events/9f5e1c5d-f13e-4ce8-b8ee-91e656c04918"

type ContactEventType = "created" | "updated" | "deleted"

export function CommunicationForm({ fields, isLoading }: CommunicationFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSending, setIsSending] = useState(false)
  const [eventType, setEventType] = useState<ContactEventType>("created")
  const [customerId, setCustomerId] = useState<string>("")
  const integrationApp = useIntegrationApp()

  useEffect(() => {
    const storedCustomerId = localStorage.getItem('integration_customer_id')
    if (storedCustomerId) {
      setCustomerId(storedCustomerId)
    }
  }, [])

  // Filter out duplicate fields by name
  const uniqueFields = fields.reduce((acc, field, index) => {
    const existingField = acc.find(f => f.name === field.name)
    if (!existingField) {
      acc.push({ ...field, id: `${field.name}-${index}` })
    }
    return acc
  }, [] as Array<{ name: string; value: any; id: string }>)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSending) return

    try {
      setIsSending(true)

      const payload = {
        type: eventType,
        customerId: customerId,
        data: {
          id: 27,
          name: formData.name || "",
          websiteUrl: formData.websiteUrl || "",
          phones: formData.phone ? [formData.phone] : [],
          primaryPhone: formData.phone || "",
          description: formData.description || "",
          ...Object.entries(formData).reduce((acc, [key, value]) => {
            if (!['name', 'websiteUrl', 'phone', 'description'].includes(key)) {
              acc[key] = value
            }
            return acc
          }, {} as Record<string, string>)
        }
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${integrationApp.token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to send data to webhook')
      }

      setFormData({})
      
    } catch (error) {
      console.error("Failed to send data:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Event Type</Label>
        <div className="flex gap-4">
          {(['created', 'updated', 'deleted'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                name="eventType"
                value={type}
                checked={eventType === type}
                onChange={(e) => setEventType(e.target.value as ContactEventType)}
                className="rounded-full border-gray-300"
              />
              <span className="text-sm capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {uniqueFields.map(field => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>{field.name}</Label>
          <Input
            id={field.id}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        </div>
      ))}

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSending}
      >
        {isSending ? "Sending..." : "Send to CRM"}
      </Button>
    </form>
  )
} 