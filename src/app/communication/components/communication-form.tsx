"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIntegrationApp } from "@integration-app/react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const WEBHOOK_URL = "https://api.integration.app/webhooks/app-events/94f7c7ce-655c-4180-bf5a-8be6db1a65ff"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export function CommunicationForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  })
  const [isSending, setIsSending] = useState(false)
  const [customerId, setCustomerId] = useState<string>("")
  const integrationApp = useIntegrationApp()

  useEffect(() => {
    const storedCustomerId = localStorage.getItem('integration_customer_id')
    if (storedCustomerId) {
      setCustomerId(storedCustomerId)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSending) return

    try {
      setIsSending(true)

      const payload = {
        customerId,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
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

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
      })
      
    } catch (error) {
      console.error("Failed to send data:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isSending) {
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
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          placeholder="Enter first name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          placeholder="Enter last name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Enter email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="Enter phone number"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSending}
      >
        {isSending ? "Pushing data..." : "Push data to CRM"}
      </Button>
    </form>
  )
} 