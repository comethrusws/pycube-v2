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
      trend: [], // Would need more complex computation
    }

    const responseData = {
      stats,
      tagging,
      overview,
      visibility,
      zonesNotScanned: ["Zone A", "Zone B"], // Placeholder
      assetDetails: {
        recentAssets: data.assets
          .slice(0, 5)
          .map((asset) => ({
            id: asset.id,
            name: asset.name,
            type: asset.type,
            location: "Zone A", // Would need zone lookup
            status: asset.status,
            lastActive: asset.lastActive,
          })),
        topCategories: [
          { name: "Medical Equipment", count: 150 },
          { name: "IT Equipment", count: 89 },
        ],
        maintenanceDue: [],
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 })
  }
}

