import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

interface WhatsAppMessage {
  from: string
  text: string
  timestamp: Date
  messageId: string
  contact: string // The normalized phone number
  direction: 'incoming' | 'outgoing'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Received webhook body:", body) // Debug log
    
    // Validate incoming webhook data
    if (!body.from || !body.text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Normalize the phone number to be consistent
    const contact = body.from.replace(/\D/g, '')

    const message: WhatsAppMessage = {
      from: body.from,
      text: body.text,
      timestamp: new Date(),
      messageId: body.messageId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contact,
      direction: 'incoming'
    }

    console.log("Attempting database connection...") // Debug log
    
    // Connect to MongoDB
    const { db } = await connectToDatabase()
    console.log("Database connected successfully") // Debug log

    // Insert the message
    const result = await db.collection("whatsapp_messages").insertOne(message)
    console.log("Message inserted:", result) // Debug log

    return NextResponse.json({ success: true, messageId: message.messageId })
  } catch (error) {
    // Detailed error logging
    console.error("Failed to process WhatsApp webhook:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Stack trace:", error.stack)
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 