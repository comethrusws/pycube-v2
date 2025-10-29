import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { apiKey } = await request.json()

  if (apiKey === "1234") {
    return NextResponse.json({ success: true, message: "Integration successful." })
  } else {
    return NextResponse.json({ success: false, message: "Invalid API key." }, { status: 400 })
  }
}
