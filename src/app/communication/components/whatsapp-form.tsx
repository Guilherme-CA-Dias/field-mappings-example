"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useIntegrationApp } from "@integration-app/react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

type MessageType = "custom" | "template"

const selectStyles = cn(
  "w-full rounded-md border border-input",
  "px-3 py-2 text-sm",
  "ring-offset-background",
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "bg-white dark:bg-gray-950",
  "text-gray-900 dark:text-gray-50"
)

interface WhatsAppMessage {
  from: string
  text: string
  timestamp: Date
  messageId: string
  contact: string
  direction: 'incoming' | 'outgoing'
}

interface WhatsAppFormProps {
  initialPhone: string
}

export function WhatsAppForm({ initialPhone }: WhatsAppFormProps) {
  const [messageType, setMessageType] = useState<MessageType>("custom")
  const [phoneNumber, setPhoneNumber] = useState(initialPhone)
  const [message, setMessage] = useState("")
  const [templateName, setTemplateName] = useState("")
  const [languageCode, setLanguageCode] = useState("")
  const [isSending, setIsSending] = useState(false)
  const integrationApp = useIntegrationApp()

  const saveMessage = async (text: string, to: string) => {
    try {
      // Normalize the phone number
      const contact = to.replace(/\D/g, '')
      
      const message: WhatsAppMessage = {
        from: 'system', // or could be your business number
        text,
        timestamp: new Date(),
        messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        contact,
        direction: 'outgoing'
      }

      await fetch('/api/messages/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      })
    } catch (error) {
      console.error("Failed to save outgoing message:", error)
    }
  }

  const handleCustomMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSending) return

    try {
      setIsSending(true)
      await integrationApp
        .connection('whatsapp')
        .action('send-message')
        .run({
          "to": phoneNumber,
          "text": message
        })

      // Save the outgoing message
      await saveMessage(message, phoneNumber)

      setPhoneNumber("")
      setMessage("")
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSending) return

    try {
      setIsSending(true)
      await integrationApp
        .connection('whatsapp')
        .action('send-template')
        .run({
          "to": phoneNumber,
          "templateName": templateName,
          "languageCode": languageCode
        })

      // Save the outgoing template message
      await saveMessage(`Template: ${templateName}`, phoneNumber)

      setPhoneNumber("")
      setTemplateName("")
      setLanguageCode("")
    } catch (error) {
      console.error("Failed to send WhatsApp template:", error)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    setPhoneNumber(initialPhone)
  }, [initialPhone])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="message-type">Message Type</Label>
        <select
          id="message-type"
          value={messageType}
          onChange={(e) => setMessageType(e.target.value as MessageType)}
          className={selectStyles}
        >
          <option value="custom">Custom Message</option>
          <option value="template">Template Message</option>
        </select>
      </div>

      {messageType === "custom" ? (
        <form onSubmit={handleCustomMessageSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="custom-phone">Phone Number</Label>
            <Input
              id="custom-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here"
              className="min-h-[150px]"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Custom Message"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleTemplateSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template-phone">Phone Number</Label>
            <Input
              id="template-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              type="tel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template Name</Label>
            <select
              id="template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className={selectStyles}
              required
            >
              <option value="">Select a template</option>
              <option value="hello_world">Hello World</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language Code</Label>
            <select
              id="language"
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
              className={selectStyles}
              required
            >
              <option value="">Select a language</option>
              <option value="en_US">English</option>
            </select>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSending || !phoneNumber || !templateName || !languageCode}
          >
            {isSending ? "Sending..." : "Send Template Message"}
          </Button>
        </form>
      )}
    </div>
  )
} 