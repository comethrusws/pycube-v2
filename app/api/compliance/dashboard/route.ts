import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    if (data.complianceData) {
      return NextResponse.json(data.complianceData)
    }
    return NextResponse.json({ summary: {}, assetRisks: [] })
  } catch (error) {
    console.error("Compliance dashboard API error:", error)
    return NextResponse.json({ summary: {}, assetRisks: [] }, { status: 500 })
  }
}


