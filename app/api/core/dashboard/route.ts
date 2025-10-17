import { loadSeedData } from "@/lib/data-loader"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "week"

    // Return pre-computed dashboard data or compute on-demand
    if (data.dashboardData) {
      return NextResponse.json(data.dashboardData)
    }

    // Fallback: compute basic dashboard data if not pre-computed
    const totalAssets = data.assets.length
    const taggedAssets = data.assets.filter((a) => a.tagId).length

    // Create zone lookup map for better performance
    const zoneMap = new Map(data.zones.map((zone) => [zone.id, zone.name]))

    const stats = {
      totalAssets,
      totalFacilities: data.facilities.length,
      totalUsers: data.users.length,
      categories: [...new Set(data.assets.map((a) => a.category || a.type))].length,
    }

    const tagging = {
      tagged: taggedAssets,
      untagged: totalAssets - taggedAssets,
      percentTagged: Math.round((taggedAssets / totalAssets) * 100),
    }

    const statusCounts = data.assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const overview = {
      notFound: statusCounts.lost || 0,
      inUse: statusCounts["in-use"] || 0,
      found: statusCounts.available || 0,
    }

    // Basic visibility data
    const recent7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentlyActive = data.assets.filter((a) => new Date(a.lastActive) > recent7Days)

    const visibility = {
      scanned: recentlyActive.length,
      notScanned: totalAssets - recentlyActive.length,
      trend: generateVisibilityTrend(data.movementLogs, totalAssets),
    }

    // Real zones not scanned (zones with no recent movement in last 24 hours)
    const recentMovements = data.movementLogs.filter(
      (log) => new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
    const scannedZoneIds = new Set(recentMovements.map((log) => log.toZoneId))
    const zonesNotScanned = data.zones
      .filter((zone) => !scannedZoneIds.has(zone.id))
      .map((zone) => zone.name)
      .slice(0, 6) // Show 6 zones as requested

    // Get top categories from actual data
    const categoryCounts = data.assets.reduce((acc, asset) => {
      const category = asset.category || asset.type
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const responseData = {
      stats,
      tagging,
      overview,
      visibility,
      zonesNotScanned,
      assetDetails: {
        recentAssets: data.assets
          .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
          .slice(0, 5)
          .map((asset) => ({
            id: asset.id,
            name: asset.name,
            type: asset.type,
            location: zoneMap.get(asset.location.zoneId) || "Unknown Zone",
            status: asset.status,
            lastActive: asset.lastActive,
          })),
        topCategories,
        maintenanceDue: data.maintenanceTasks
          .filter((task) => task.status === "pending")
          .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
          .slice(0, 5)
          .map((task) => {
            const asset = data.assets.find((a) => a.id === task.assetId)
            return {
              id: task.id,
              assetId: task.assetId,
              name: asset?.name || "Unknown Asset",
              dueDate: task.scheduledDate,
              type: task.type || "maintenance",
            }
          }),
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 })
  }
}

// Helper function to generate visibility trend data
function generateVisibilityTrend(movementLogs: any[], totalAssets: number) {
  const trend = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]

    const dayMovements = movementLogs.filter((log) => log.timestamp.startsWith(dateStr))
    const scannedAssets = new Set(dayMovements.map((log) => log.assetId)).size
    const notScannedAssets = Math.max(0, totalAssets - scannedAssets)

    trend.push({
      date: dateStr,
      scanned: scannedAssets,
      notScanned: notScannedAssets,
    })
  }
  return trend
}

