import { NextResponse } from "next/server"
import { getStore } from "@/data/store"

export async function GET() {
  const store = getStore()
  const totalMonitored = store.assets.length
  const toBeLocated = Math.round(totalMonitored * 0.1)
  const located = totalMonitored - toBeLocated
  const flagged = Math.round(totalMonitored * 0.02)

  const byType = Object.entries(
    store.assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Simple trend over 6 days
  const locationTrends = Array.from({ length: 6 }, (_, i) => {
    const locatedToday = Math.round((located / 6) * (i + 1) * 0.2)
    const unlocated = Math.max(0, 10 - locatedToday)
    const day = new Date(Date.now() - (5 - i) * 86400000)
    const date = day.toISOString().slice(0, 10)
    return { date, located: locatedToday, unlocated }
  })

  const recordedLocations = [
    { name: "No Location", value: Math.round(totalMonitored * 0.3) },
    { name: "Clinical Engineering", value: Math.round(totalMonitored * 0.2) },
    { name: "ICU", value: Math.round(totalMonitored * 0.1) },
  ]

  return NextResponse.json({
    cards: { totalMonitored, toBeLocated, located, flagged },
    charts: { byType, locationTrends, recordedLocations },
  })
}


