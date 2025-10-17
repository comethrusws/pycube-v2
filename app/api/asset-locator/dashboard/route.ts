import { NextResponse } from "next/server"
import { loadData } from "../../../../lib/data"

export async function GET() {
  const data = loadData()
  const total = data.assets.length
  const located = Math.floor(total * 0.2)
  const toLocate = total - located

  // Top types distribution (mocked from actual counts)
  const typeCounts = new Map<string, number>()
  for (const a of data.assets) {
    typeCounts.set(a.type, (typeCounts.get(a.type) || 0) + 1)
  }
  const monitoredCategories = Array.from(typeCounts.entries())
    .slice(0, 4)
    .map(([name, value]) => ({ name, value, color: "#0d7a8c" }))

  const recordedLocations = [
    { name: "No Location", value: 65, color: "#e5e7eb" },
    { name: data.buildings[0]?.name || "Building A", value: 20, color: "#0d7a8c" },
    { name: data.departments[0]?.name || "Dept", value: 15, color: "#7c3aed" },
  ]

  return NextResponse.json({
    stats: { total, toLocate, located, flagged: Math.floor(total * 0.01) },
    monitoredCategories,
    locationTrends: [],
    recordedLocations,
    flaggedReasons: [{ name: "Flagged", value: 100, color: "#0d7a8c" }],
  })
}

