import { NextRequest, NextResponse } from "next/server"
import { readdirSync, readFileSync } from "fs"
import { join } from "path"

export async function GET(request: NextRequest) {
  try {
    const dir = join(process.cwd(), "data", "reports")
    let items: { id: string; createdAt: string; summary?: any }[] = []
    try {
      const files = readdirSync(dir).filter(f => f.endsWith('.json'))
      items = files.map(f => {
        const id = f.replace(/\.json$/, "")
        const raw = readFileSync(join(dir, f), "utf-8")
        const json = JSON.parse(raw)
        return { id, createdAt: new Date(parseInt(id.split('-')[1] || Date.now().toString(), 10)).toISOString(), summary: json.summary }
      }).sort((a, b) => b.id.localeCompare(a.id))
    } catch {}
    return NextResponse.json({ reports: items })
  } catch (error) {
    console.error("List reports error:", error)
    return NextResponse.json({ reports: [] }, { status: 500 })
  }
}


