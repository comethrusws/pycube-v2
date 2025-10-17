import { NextResponse } from "next/server"
import { loadData } from "../../../../lib/data"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = (searchParams.get("range") || "week").toLowerCase() as "day" | "week" | "month"
  const data = loadData()
  const totalAssets = data.assets.length
  const totalFacilities = data.facilities.length
  const totalUsers = data.users.length
  const categories = new Set(data.assets.map((a) => a.type)).size || 0
  const tagged = Math.floor(totalAssets * 0.3)
  const untagged = Math.max(totalAssets - tagged, 0)
  const inUse = data.assets.filter((a) => a.status === "in-use").length
  const maintenance = data.assets.filter((a) => a.status === "maintenance").length
  const lost = data.assets.filter((a) => a.status === "lost").length

  // Visibility (scans): compute based on movement logs in the last 7 days
  const now = new Date()
  const DAY_MS = 24 * 60 * 60 * 1000
  const windowDays = range === "day" ? 1 : range === "week" ? 7 : 30
  const startWindow = new Date(now.getTime() - (windowDays - 1) * DAY_MS)
  const recentLogs = data.movementLogs.filter((m) => {
    const t = new Date(m.timestamp).getTime()
    return t >= startWindow.getTime()
  })
  const scannedAssetIds = new Set(recentLogs.map((m) => m.assetId))
  const scannedWindow = scannedAssetIds.size
  const notScannedWindow = Math.max(totalAssets - scannedWindow, 0)

  // Build trend: hourly for day, daily otherwise
  const trend: { date: string; scanned: number; notScanned: number }[] = []
  if (range === "day") {
    for (let h = 23; h >= 0; h--) {
      const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - h)
      const hourEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - h + 1)
      const hourScanned = new Set(
        data.movementLogs
          .filter((m) => {
            const t = new Date(m.timestamp).getTime()
            return t >= hourStart.getTime() && t < hourEnd.getTime()
          })
          .map((m) => m.assetId),
      ).size
      trend.push({
        date: `${hourStart.getHours().toString().padStart(2, "0")}:00`,
        scanned: hourScanned,
        notScanned: Math.max(totalAssets - hourScanned, 0),
      })
    }
  } else {
    const days = range === "week" ? 7 : 30
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)
      const dayScanned = new Set(
        data.movementLogs
          .filter((m) => {
            const t = new Date(m.timestamp).getTime()
            return t >= dayStart.getTime() && t < dayEnd.getTime()
          })
          .map((m) => m.assetId),
      ).size
      trend.push({
        date: dayStart.toISOString().slice(5, 10),
        scanned: dayScanned,
        notScanned: Math.max(totalAssets - dayScanned, 0),
      })
    }
  }

  return NextResponse.json({
    stats: {
      totalAssets,
      totalFacilities,
      totalUsers,
      categories,
    },
    tagging: { tagged, untagged, percentTagged: Math.round((tagged / totalAssets) * 100) },
    overview: { notFound: lost, inUse, found: Math.max(totalAssets - (lost + inUse), 0) },
    visibility: {
      scanned: scannedWindow,
      notScanned: notScannedWindow,
      trend,
    },
    zonesNotScanned: data.zones.slice(0, 6).map((z) => z.name),
    maintenance,
  })
}

