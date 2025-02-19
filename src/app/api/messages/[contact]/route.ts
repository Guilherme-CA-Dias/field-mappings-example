import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(
  request: Request,
  context: { params: { contact: string } }
) {
  try {
    // Get contact from URL instead of params
    const url = new URL(request.url)
    const contact = url.pathname.split('/').pop() || ''

    const { db } = await connectToDatabase()

    const messages = await db
      .collection("whatsapp_messages")
      .find({ contact })
      .sort({ timestamp: -1 })
      .toArray()

    messages.reverse()

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
} 