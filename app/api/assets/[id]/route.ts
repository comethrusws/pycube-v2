import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Asset } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const file = await fs.readFile(path.resolve(process.cwd(), "data/seed.json"), "utf8")
  const data = JSON.parse(file)
  const asset = data.assets.find((asset: Asset) => asset.id === id)

  if (asset) {
    return NextResponse.json(asset)
  } else {
    return NextResponse.json({ message: "Asset not found" }, { status: 404 })
  }
}
