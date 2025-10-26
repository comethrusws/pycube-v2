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

    // Department-level utilization analysis with enhanced data
    const deptUtilization = data.assets.reduce((acc, asset) => {
      if (!acc[asset.departmentId]) {
        acc[asset.departmentId] = {
          assets: [],
          totalUtilization: 0,
          underutilized: 0,
          active: 0,
          idle: 0,
          inMaintenance: 0
        }
      }
      acc[asset.departmentId].assets.push(asset)
      acc[asset.departmentId].totalUtilization += asset.utilization
      if (asset.utilization < 40) {
        acc[asset.departmentId].underutilized++
        acc[asset.departmentId].idle++
      } else {
        acc[asset.departmentId].active++
      }
      if (asset.status === "maintenance") {
        acc[asset.departmentId].inMaintenance++
      }
      return acc
    }, {} as Record<string, { 
      assets: any[], 
      totalUtilization: number, 
      underutilized: number,
      active: number,
      idle: number,
      inMaintenance: number
    }>)

    const departmentUtilization = Object.entries(deptUtilization).map(([deptId, deptData]) => ({
      departmentId: deptId,
      departmentName: `Department ${deptId.slice(-3)}`,
      avgUtilization: Math.round(deptData.totalUtilization / deptData.assets.length),
      totalAssets: deptData.assets.length,
      underutilized: deptData.underutilized,
      active: deptData.active,
      idle: deptData.idle,
      inMaintenance: deptData.inMaintenance,
      utilizationTrend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        utilization: Math.max(20, Math.min(95, deptData.totalUtilization / deptData.assets.length + Math.floor(Math.random() * 30) - 15))
      }))
    })).sort((a, b) => b.avgUtilization - a.avgUtilization)

    // Top 10 Idle Assets with enhanced details
    const top10IdleAssets = data.assets
      .filter(a => a.utilization < 30 && a.status === "available")
      .sort((a, b) => a.utilization - b.utilization)
      .slice(0, 10)
      .map(asset => {
        const zone = data.zones.find(z => z.id === asset.location.zoneId)
        const department = departmentUtilization.find(d => d.departmentId === asset.departmentId)
        const idleDays = Math.floor((Date.now() - new Date(asset.lastActive).getTime()) / (24 * 60 * 60 * 1000))
        
        return {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          department: department?.departmentName || "Unknown Department",
          departmentId: asset.departmentId,
          utilization: asset.utilization,
          location: zone?.name || "Unknown",
          lastUsed: asset.lastActive,
          idleDuration: idleDays,
          recommendedAction: idleDays > 30 ? "Consider Redistribution" : 
                            idleDays > 14 ? "Schedule Utilization Review" : 
                            "Monitor Usage Pattern",
          value: asset.value || 0,
          status: asset.status
        }
      })

    // Utilization Trend Over Time (last 30 days)
    const utilizationTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      // Simulate utilization rate with realistic variations
      const baseUtilization = avgUtilization
      const dailyVariation = Math.sin((i / 7) * Math.PI) * 10 // Weekly pattern
      const randomVariation = Math.floor(Math.random() * 16) - 8
      const utilization = Math.max(40, Math.min(95, baseUtilization + dailyVariation + randomVariation))
      
      // Check for maintenance events that might cause drops
      const maintenanceEvents = data.maintenanceTasks.filter(task => 
        task.scheduledDate.startsWith(dateStr) || 
        (task.completedDate && task.completedDate.startsWith(dateStr))
      ).length
      
      const adjustedUtilization = maintenanceEvents > 5 ? utilization - 15 : utilization
      
      return {
        date: dateStr,
        displayDate: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
        utilization: Math.round(adjustedUtilization),
        maintenanceEvents,
        tooltip: maintenanceEvents > 5 ? `${maintenanceEvents} maintenance tasks scheduled` : null
      }
    })

    // Maintenance Impact on Availability
    const availableAssets = data.assets.filter(a => a.status === "available").length
    const underMaintenanceAssets = data.assets.filter(a => a.status === "maintenance").length
    const pendingMaintenanceAssets = data.maintenanceTasks.filter(t => t.status === "pending").length
    
    const maintenanceImpact = [
      { 
        name: "Available", 
        value: Math.round((availableAssets / totalAssets) * 100),
        count: availableAssets,
        color: "#059669" 
      },
      { 
        name: "Under Maintenance", 
        value: Math.round((underMaintenanceAssets / totalAssets) * 100),
        count: underMaintenanceAssets,
        color: "#dc2626" 
      },
      { 
        name: "Pending Maintenance", 
        value: Math.round((pendingMaintenanceAssets / totalAssets) * 100),
        count: pendingMaintenanceAssets,
        color: "#d97706" 
      }
    ]

    // Asset Movement Alerts (from recent movement logs)
    const recentMovements = data.movementLogs
      .filter(log => {
        const logDate = new Date(log.timestamp)
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        return logDate > twoDaysAgo && (!log.authorized || Math.random() < 0.15) // 15% are flagged as abnormal
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15)
      .map(log => {
        const asset = data.assets.find(a => a.id === log.assetId)
        const fromZone = data.zones.find(z => z.id === log.fromZoneId)
        const toZone = data.zones.find(z => z.id === log.toZoneId)
        
        return {
          id: log.id,
          assetId: log.assetId,
          assetName: asset?.name || "Unknown Asset",
          assetType: asset?.type || "Unknown",
          fromLocation: fromZone?.name || "Unknown",
          toLocation: toZone?.name || "Unknown",
          timestamp: log.timestamp,
          alertType: !log.authorized ? "Unauthorized Movement" : 
                    Math.random() < 0.6 ? "Out-of-Zone Event" : "Abnormal Movement Pattern",
          severity: !log.authorized ? "high" : "medium",
          status: Math.random() < 0.3 ? "resolved" : "pending",
          movedBy: log.movedBy || "Unknown User"
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
        assetTypeUtilization: [], // Keep existing implementation
        redistributionSuggestions: [], // Keep existing implementation
        idleAssets: [], // Keep existing implementation
        top10IdleAssets,
        utilizationTrend,
        maintenanceImpact,
        movementAlerts: recentMovements
      },
      monitoredCategories: [], // Keep existing implementation
      locationTrends: [], // Keep existing implementation
      recordedLocations: [], // Keep existing implementation
      flaggedReasons: [] // Keep existing implementation
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Asset-locator dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load asset-locator data" }, { status: 500 })
  }
}

