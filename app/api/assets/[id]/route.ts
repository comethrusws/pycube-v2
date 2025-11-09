import { NextRequest, NextResponse } from "next/server"
import { loadData } from "@/lib/data"
import type { Asset } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = loadData()
    const asset = data.assets.find((asset: Asset) => asset.id === id)

    if (asset) {
      return NextResponse.json(asset)
    } else {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Asset API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
