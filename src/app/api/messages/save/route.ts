import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

interface WhatsAppMessage {
  from: string
  text: string
  timestamp: Date
  messageId: string
  contact: string
  direction: 'incoming' | 'outgoing'
}

export async function POST(req: Request) {
  try {
    const message = await req.json()
    
    // Ensure timestamp is a Date object
    const messageToSave = {
      ...message,
      timestamp: new Date(message.timestamp),
      messageId: message.messageId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    const { db } = await connectToDatabase()
    await db.collection("whatsapp_messages").insertOne(messageToSave)

    return NextResponse.json({ success: true, messageId: messageToSave.messageId })
  } catch (error) {
    console.error("Failed to save message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 