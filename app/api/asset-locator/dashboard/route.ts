import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    // Use pre-computed asset-locator data if available, otherwise compute on-demand
    if (data.assetLocatorData) {
      return NextResponse.json(data.assetLocatorData)
    }

    // Fallback: compute asset-locator data on-demand with enhanced utilization analytics
    const totalAssets = data.assets.length
    const locatedAssets = data.assets.filter(a => a.status !== "lost").length
    const assetsToLocate = totalAssets - locatedAssets
    const flaggedAssets = data.assets.filter(a => 
      a.status === "lost" || 
      data.maintenanceTasks.some(m => m.assetId === a.id && m.status === "overdue")
    ).length

    // Enhanced utilization analytics
    const underutilizedAssets = data.assets.filter(a => a.utilization < 40)
    const underutilizedCount = underutilizedAssets.length
    const avgUtilization = Math.round(data.assets.reduce((sum, a) => sum + a.utilization, 0) / data.assets.length)

    // Department-level utilization analysis
    const deptUtilization = data.assets.reduce((acc, asset) => {
      if (!acc[asset.departmentId]) {
        acc[asset.departmentId] = {
          assets: [],
          totalUtilization: 0,
          underutilized: 0
        }
      }
      acc[asset.departmentId].assets.push(asset)
      acc[asset.departmentId].totalUtilization += asset.utilization
      if (asset.utilization < 40) {
        acc[asset.departmentId].underutilized++
      }
      return acc
    }, {} as Record<string, { assets: any[], totalUtilization: number, underutilized: number }>)

    const departmentUtilization = Object.entries(deptUtilization).map(([deptId, data]) => ({
      departmentId: deptId,
      departmentName: `Department ${deptId.slice(-3)}`,
      avgUtilization: Math.round(data.totalUtilization / data.assets.length),
      totalAssets: data.assets.length,
      underutilized: data.underutilized,
      utilizationTrend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        utilization: Math.max(20, Math.min(95, data.totalUtilization / data.assets.length + Math.floor(Math.random() * 30) - 15))
      }))
    })).sort((a, b) => a.avgUtilization - b.avgUtilization)

    // Asset type utilization breakdown
    const typeUtilization = data.assets.reduce((acc, asset) => {
      if (!acc[asset.type]) {
        acc[asset.type] = { total: 0, utilization: 0, underutilized: 0 }
      }
      acc[asset.type].total++
      acc[asset.type].utilization += asset.utilization
      if (asset.utilization < 40) acc[asset.type].underutilized++
      return acc
    }, {} as Record<string, { total: number, utilization: number, underutilized: number }>)

    const assetTypeUtilization = Object.entries(typeUtilization)
      .map(([type, data]) => ({
        type,
        avgUtilization: Math.round(data.utilization / data.total),
        totalAssets: data.total,
        underutilized: data.underutilized,
        utilizationRate: Math.round((data.total - data.underutilized) / data.total * 100)
      }))
      .sort((a, b) => a.avgUtilization - b.avgUtilization)

    // Generate redistribution suggestions
    const redistributionSuggestions = []
    const lowUtilDepts = departmentUtilization.filter(d => d.avgUtilization < 50).slice(0, 3)
    const highUtilDepts = departmentUtilization.filter(d => d.avgUtilization > 80).slice(0, 3)

    for (let i = 0; i < Math.min(5, lowUtilDepts.length); i++) {
      const lowDept = lowUtilDepts[i]
      const highDept = highUtilDepts[i % highUtilDepts.length] || highUtilDepts[0]
      
      if (highDept) {
        const lowDeptAssets = data.assets.filter(a => a.departmentId === lowDept.departmentId && a.utilization < 30)
        if (lowDeptAssets.length > 0) {
          const suggestedAsset = lowDeptAssets[Math.floor(Math.random() * lowDeptAssets.length)]
          redistributionSuggestions.push({
            id: `redistrib-${i}`,
            assetId: suggestedAsset.id,
            assetName: suggestedAsset.name,
            assetType: suggestedAsset.type,
            currentUtilization: suggestedAsset.utilization,
            fromDepartment: lowDept.departmentName,
            fromDepartmentId: lowDept.departmentId,
            toDepartment: highDept.departmentName,
            toDepartmentId: highDept.departmentId,
            potentialImpact: `+${Math.floor(Math.random() * 20) + 25}% utilization`,
            priority: suggestedAsset.utilization < 20 ? "high" : "medium",
            estimatedSavings: Math.floor(Math.random() * 4000) + 1000,
            reason: "Low utilization in current department, high demand in target department"
          })
        }
      }
    }

    // Idle asset alerts
    const idleAssets = data.assets
      .filter(a => a.utilization < 20 && a.status === "available")
      .sort((a, b) => a.utilization - b.utilization)
      .slice(0, 10)
      .map(asset => {
        const zone = data.zones.find(z => z.id === asset.location.zoneId)
        return {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          utilization: asset.utilization,
          location: zone?.name || "Unknown",
          departmentId: asset.departmentId,
          lastActive: asset.lastActive,
          idleDays: Math.floor((Date.now() - new Date(asset.lastActive).getTime()) / (24 * 60 * 60 * 1000))
        }
      })

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
    const locationTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
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
        flagged: flaggedAssets,
        underutilized: underutilizedCount,
        avgUtilization
      },
      utilization: {
        departmentUtilization,
        assetTypeUtilization,
        redistributionSuggestions,
        idleAssets
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

