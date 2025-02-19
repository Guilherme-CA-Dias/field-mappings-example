"use client"

import { useIntegrationApp } from "@integration-app/react"
import { useEffect, useState, useRef, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle } from "lucide-react"
import { usePhoneContext } from "./phone-context"
import { Button } from "@/components/ui/button"
import { ChatModal } from "./chat-modal"

interface Contact {
  id: string
  name: string
  fields: {
    websiteUrl?: string
    primaryPhone?: string
    description?: string
    industry?: string
    primaryAddress?: {
      full: string
    }
  }
}

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const integrationApp = useIntegrationApp()
  const { setPhoneNumber } = usePhoneContext()
  const [activeChat, setActiveChat] = useState<{ contact: string; phone: string } | null>(null)

  const fetchContacts = useCallback(async (nextCursor: string | null = null) => {
    try {
      const response = await integrationApp
        .connection('hubspot')
        .action('list-companies')
        .run({
          cursor: nextCursor
        })

      const newContacts = response.output.records || []
      setContacts(prev => nextCursor ? [...prev, ...newContacts] : newContacts)
      setCursor(response.output.cursor)
      setHasMore(!!response.output.cursor)
    } catch (err) {
      console.error("Failed to fetch contacts:", err)
      setError("Failed to load contacts")
    }
  }, [integrationApp])

  useEffect(() => {
    setIsLoading(true)
    fetchContacts()
      .finally(() => setIsLoading(false))
  }, [fetchContacts])

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !hasMore || isLoadingMore) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setIsLoadingMore(true)
      fetchContacts(cursor)
        .finally(() => setIsLoadingMore(false))
    }
  }, [cursor, hasMore, isLoadingMore, fetchContacts])

  const handleWhatsAppClick = (phone: string) => {
    const contact = phone.replace(/\D/g, '')
    setPhoneNumber(phone)
    setActiveChat({ contact, phone })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border">
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Companies List</h2>
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[500px] overflow-y-auto rounded-lg border bg-gray-50 dark:bg-gray-900 p-4"
      >
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              className="p-4 rounded-lg border bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors flex justify-between items-start"
            >
              <div>
                <h3 className="font-medium mb-1">{contact.name}</h3>
                {contact.fields.primaryPhone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contact.fields.primaryPhone}
                  </p>
                )}
                {contact.fields.industry && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contact.fields.industry}
                  </p>
                )}
              </div>
              {contact.fields.primaryPhone && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleWhatsAppClick(contact.fields.primaryPhone!)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 h-14 w-14 p-0"
                >
                  <MessageCircle className="h-8 w-8" />
                </Button>
              )}
            </div>
          ))}
          {isLoadingMore && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading more...
            </div>
          )}
        </div>
      </div>

      {activeChat && (
        <ChatModal
          contact={activeChat.contact}
          phoneNumber={activeChat.phone}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  )
} 