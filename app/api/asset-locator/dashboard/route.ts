import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    // Use pre-computed asset-locator data if available, otherwise compute on-demand
    if (data.assetLocatorData) {
      return NextResponse.json(data.assetLocatorData)
    }

    // Fallback: compute asset-locator data on-demand
    const totalAssets = data.assets.length
    const locatedAssets = data.assets.filter(a => a.status !== "lost").length
    const assetsToLocate = totalAssets - locatedAssets
    const flaggedAssets = data.assets.filter(a => 
      a.status === "lost" || 
      data.maintenanceTasks.some(m => m.assetId === a.id && m.status === "overdue")
    ).length

    // Monitored categories from actual data
    const categoryCounts = data.assets.reduce((acc, asset) => {
      const category = asset.category || asset.type
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalCategoryAssets = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
    const monitoredCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / totalCategoryAssets) * 100),
        color: [
          "#0d7a8c", "#1e40af", "#7c3aed", "#dc2626", 
          "#059669", "#d97706"
        ][index % 6]
      }))

    // Location trends (simplified for fallback)
    const locationTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
      const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
      
      return {
        date: dateStr,
        located: Math.floor(totalAssets * 0.75) + Math.floor(Math.random() * 50),
        unlocated: Math.floor(totalAssets * 0.25) + Math.floor(Math.random() * 20)
      }
    })

    // Zone distribution
    const zoneCounts = data.assets.reduce((acc, asset) => {
      const zone = data.zones.find(z => z.id === asset.location.zoneId)
      const zoneName = zone?.name || "Unknown"
      acc[zoneName] = (acc[zoneName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalZoneAssets = Object.values(zoneCounts).reduce((sum, count) => sum + count, 0)
    const recordedLocations = Object.entries(zoneCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / totalZoneAssets) * 100),
        color: [
          "#0d7a8c", "#1e40af", "#7c3aed", "#dc2626", 
          "#059669", "#d97706", "#be123c", "#4338f5"
        ][index % 8]
      }))

    // Flagged reasons
    const flaggedReasons = [
      { name: "Asset Lost", value: 35, color: "#dc2626" },
      { name: "Maintenance Overdue", value: 25, color: "#d97706" },
      { name: "Unauthorized Movement", value: 20, color: "#7c3aed" },
      { name: "Low Battery", value: 12, color: "#059669" },
      { name: "Geofence Violation", value: 8, color: "#1e40af" }
    ]

    const responseData = {
      stats: {
        total: totalAssets,
        toLocate: assetsToLocate,
        located: locatedAssets,
        flagged: flaggedAssets
      },
      monitoredCategories,
      locationTrends,
      recordedLocations,
      flaggedReasons
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Asset-locator dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load asset-locator data" }, { status: 500 })
  }
}

