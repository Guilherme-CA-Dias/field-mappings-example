"use client"

import { useEffect, useState, useRef } from "react"
import { X, Send, AlertCircle } from "lucide-react"
import { useIntegrationApp } from "@integration-app/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  _id?: string  // Add optional _id for MongoDB documents
  from: string
  text: string
  timestamp: Date
  messageId: string
  contact: string
  direction: 'incoming' | 'outgoing'
}

interface ChatModalProps {
  contact: string
  phoneNumber: string
  onClose: () => void
}

export function ChatModal({ contact, phoneNumber, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const integrationApp = useIntegrationApp()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showTemplateAlert, setShowTemplateAlert] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkMessageTimestamp = (messages: Message[]) => {
    if (messages.length === 0) {
      return true // Always show template alert if no messages
    }

    const lastMessage = messages[messages.length - 1]
    const lastMessageTime = new Date(lastMessage.timestamp).getTime()
    const currentTime = new Date().getTime()
    const hoursDifference = (currentTime - lastMessageTime) / (1000 * 60 * 60)

    return hoursDifference > 24
  }

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/messages/${contact}`)
        const data = await response.json()
        
        // Only update if we have new messages or no messages yet
        if (data.messages.length !== messages.length || data.messages.length === 0) {
          setMessages(data.messages)
          setShowTemplateAlert(checkMessageTimestamp(data.messages))
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [contact, messages.length])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSending || !newMessage.trim()) return

    try {
      setIsSending(true)
      
      // Send message via WhatsApp
      await integrationApp
        .connection('whatsapp')
        .action('send-message')
        .run({
          "to": phoneNumber,
          "text": newMessage
        })

      // Save message to our database
      const message: Omit<Message, 'messageId'> = {
        from: 'system',
        text: newMessage,
        contact,
        direction: 'outgoing',
        timestamp: new Date()
      }

      await fetch('/api/messages/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      })

      // Clear input
      setNewMessage("")
      
      // Refresh messages
      const response = await fetch(`/api/messages/${contact}`)
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-[450px] h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <div>
          <h3 className="font-medium">{phoneNumber}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : (
          <>
            {showTemplateAlert && (
              <div className="mb-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Template Message Required
                    </h4>
                    <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
                      {messages.length === 0 
                        ? "Start the conversation by sending a template message first."
                        : "It's been over 24 hours since the last message. Please send a template message to resume the conversation."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs bg-white hover:bg-gray-50 text-gray-700 border-gray-200 
                        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      onClick={() => {
                        onClose()
                        document.getElementById('whatsapp-form')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Send Template Message
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 && !showTemplateAlert ? (
              <div className="text-center text-gray-500">No messages yet</div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id || message.messageId}
                  className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.direction === 'outgoing'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <span className={`text-[10px] ${
                      message.direction === 'outgoing'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    } block mt-1`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={showTemplateAlert 
              ? "Please send a template message first" 
              : "Type a message..."}
            className="min-h-[50px] max-h-[120px] resize-none text-sm py-2 bg-gray-50 dark:bg-gray-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (newMessage.trim() && !showTemplateAlert) {
                  handleSendMessage(e)
                }
              }
            }}
            disabled={showTemplateAlert}
          />
          <Button 
            type="submit"
            disabled={isSending || !newMessage.trim() || showTemplateAlert}
            className="self-end h-10 w-10 p-0 rounded-full"
            variant="default"
          >
            {isSending ? (
              <span className="animate-pulse">...</span>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 