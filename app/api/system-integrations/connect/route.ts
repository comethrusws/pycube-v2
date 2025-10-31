import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { apiKey } = await request.json()

  // Accept any non-empty API key to enable realistic demo integrations
  if (typeof apiKey === "string" && apiKey.trim().length > 0) {
    return NextResponse.json({ success: true, message: "Integration successful." })
  }
  return NextResponse.json({ success: false, message: "API key is required." }, { status: 400 })
}
