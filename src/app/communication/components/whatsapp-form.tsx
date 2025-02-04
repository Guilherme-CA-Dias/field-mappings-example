"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useIntegrationApp } from "@integration-app/react"
import { useState } from "react"
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

export function WhatsAppForm() {
  const [messageType, setMessageType] = useState<MessageType>("custom")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [templateName, setTemplateName] = useState("")
  const [languageCode, setLanguageCode] = useState("")
  const [isSending, setIsSending] = useState(false)
  const integrationApp = useIntegrationApp()

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

      setPhoneNumber("")
      setTemplateName("")
      setLanguageCode("")
    } catch (error) {
      console.error("Failed to send WhatsApp template:", error)
    } finally {
      setIsSending(false)
    }
  }

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