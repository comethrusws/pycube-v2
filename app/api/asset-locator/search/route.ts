import { NextResponse } from "next/server"
import { loadData } from "../../../../lib/data"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()
  const data = loadData()
  const results = data.assets
    .filter((a) => a.name.toLowerCase().includes(q) || a.tagId.toLowerCase().includes(q))
    .slice(0, 100)
    .map((a) => ({ id: a.id, name: a.name, tagId: a.tagId, status: a.status, location: a.location }))
  return NextResponse.json({ results })
}

