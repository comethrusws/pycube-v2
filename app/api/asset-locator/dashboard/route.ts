import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    // Use pre-computed asset-locator data if available, otherwise compute on-demand
    if (data.assetLocatorData) {
      return NextResponse.json(data.assetLocatorData)
    }

    // Fallback: compute asset-locator data on-demand with enhanced utilization analytics (tagged assets only)
    const taggedAssets = data.assets.filter(a => a.tagId)
    const totalAssets = taggedAssets.length
    const locatedAssets = taggedAssets.filter(a => a.status !== "lost").length
    const assetsToLocate = totalAssets - locatedAssets
    const flaggedAssets = taggedAssets.filter(a => 
      a.status === "lost" || 
      data.maintenanceTasks.some(m => m.assetId === a.id && m.status === "overdue")
    ).length

    // Enhanced utilization analytics (tagged assets only)
    const underutilizedAssets = taggedAssets.filter(a => a.utilization < 40)
    const underutilizedCount = underutilizedAssets.length
    const avgUtilization = Math.round(taggedAssets.reduce((sum, a) => sum + a.utilization, 0) / taggedAssets.length)

    // Department-level utilization analysis with enhanced data (tagged assets only)
    const deptUtilization = taggedAssets.reduce((acc, asset) => {
      if (!acc[asset.departmentId]) {
        acc[asset.departmentId] = {
          assets: [],
          totalUtilization: 0,
          underutilized: 0,
          active: 0,
          idle: 0,
          inMaintenance: 0,
          available: 0,
          pendingMaintenance: 0
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
      if (asset.status === "available") {
        acc[asset.departmentId].available++
      }
      return acc
    }, {} as Record<string, { 
      assets: any[], 
      totalUtilization: number, 
      underutilized: number,
      active: number,
      idle: number,
      inMaintenance: number,
      available: number,
      pendingMaintenance: number
    }>)

    data.maintenanceTasks.forEach(task => {
      const asset = taggedAssets.find(a => a.id === task.assetId)
      if (asset && task.status === 'pending') {
        if (deptUtilization[asset.departmentId]) {
          deptUtilization[asset.departmentId].pendingMaintenance++
        }
      }
    })

    let departmentUtilization = Object.entries(deptUtilization).map(([deptId, deptData]) => {
      const totalAssets = deptData.assets.length;
      // Compute percentages first, then derive available as the remainder to ensure the stack reaches 100%
      const underMaintenancePct = Math.round((deptData.inMaintenance / totalAssets) * 100)
      const pendingMaintenancePct = Math.round((deptData.pendingMaintenance / totalAssets) * 100)
      const availablePct = Math.max(0, 100 - underMaintenancePct - pendingMaintenancePct)

      return {
        departmentId: deptId,
        departmentName: `Department ${deptId.slice(-3)}`,
        avgUtilization: Math.round(deptData.totalUtilization / totalAssets),
        totalAssets: totalAssets,
        underutilized: deptData.underutilized,
        active: deptData.active,
        idle: deptData.idle,
        inMaintenance: deptData.inMaintenance,
        // Stacked bar values (must sum to 100)
        available: availablePct,
        underMaintenance: underMaintenancePct,
        pendingMaintenance: pendingMaintenancePct,
        utilizationTrend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          utilization: Math.max(20, Math.min(95, deptData.totalUtilization / totalAssets + Math.floor(Math.random() * 30) - 15))
        }))
      }
    }).sort((a, b) => b.avgUtilization - a.avgUtilization)

    // Ensure distribution across buckets so filters have results
    const n = departmentUtilization.length
    if (n > 0) {
      // Top 4-5 fully utilized (>= 90%)
      const topCount = Math.min(5, n)
      for (let i = 0; i < topCount; i++) {
        departmentUtilization[i].avgUtilization = Math.max(departmentUtilization[i].avgUtilization, 90 + Math.floor(Math.random() * 8))
      }

      // Bottom 2-3 under 40%
      const low40Count = Math.min(3, n)
      for (let i = 0; i < low40Count; i++) {
        const idx = n - 1 - i
        departmentUtilization[idx].avgUtilization = Math.min(departmentUtilization[idx].avgUtilization, 25 + Math.floor(Math.random() * 13)) // 25-37
      }

      // Next 2-3 in 40-60% bucket
      const low60Count = Math.min(3, Math.max(0, n - low40Count - topCount))
      for (let i = 0; i < low60Count; i++) {
        const idx = n - 1 - low40Count - i
        departmentUtilization[idx].avgUtilization = 45 + Math.floor(Math.random() * 13) // 45-57
      }
    }

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

    // Utilization Trend Over Time (last 30 days) - Enhanced data
    const utilizationTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      // Simulate utilization rate with more realistic variations
      const baseUtilization = avgUtilization
      
      // Create more realistic patterns
      const weeklyPattern = Math.sin((i / 7) * 2 * Math.PI) * 8 // Weekly cyclical pattern
      const weekdayEffect = date.getDay() === 0 || date.getDay() === 6 ? -5 : 0 // Weekend effect
      const randomVariation = (Math.random() - 0.5) * 10 // Random daily variation
      
      let utilization = baseUtilization + weeklyPattern + weekdayEffect + randomVariation
      
      // Check for maintenance events that might cause drops
      const maintenanceEvents = data.maintenanceTasks.filter(task => 
        task.scheduledDate.startsWith(dateStr) || 
        (task.completedDate && task.completedDate.startsWith(dateStr))
      ).length
      
      // Apply maintenance impact
      if (maintenanceEvents > 5) {
        utilization -= 15
      } else if (maintenanceEvents > 2) {
        utilization -= 5
      }
      
      // Keep utilization within realistic bounds
      utilization = Math.max(Math.min(avgUtilization * 0.3, 25), Math.min(95, utilization))
      
      return {
        date: dateStr,
        displayDate: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
        utilization: Math.round(utilization),
        maintenanceEvents,
        tooltip: maintenanceEvents > 5 ? `${maintenanceEvents} maintenance tasks scheduled` : null
      }
    })

    // Maintenance Impact on Availability (tagged assets only)
    const availableAssets = taggedAssets.filter(a => a.status === "available").length
    const underMaintenanceAssets = taggedAssets.filter(a => a.status === "maintenance").length
    const pendingMaintenanceAssets = data.maintenanceTasks.filter(t => {
      const asset = taggedAssets.find(a => a.id === t.assetId)
      return asset && t.status === "pending"
    }).length
    
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

    // Asset Movement Alerts (from recent movement logs of tagged assets only)
    const taggedAssetIds = new Set(taggedAssets.map(a => a.id))
    const recentMovements = data.movementLogs
      .filter(log => {
        const logDate = new Date(log.timestamp)
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        return taggedAssetIds.has(log.assetId) && logDate > twoDaysAgo && (!log.authorized || Math.random() < 0.15) // 15% are flagged as abnormal
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15)
      .map(log => {
        const asset = taggedAssets.find(a => a.id === log.assetId)
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

    // Monitored categories from tagged assets only
    const categoryCounts = taggedAssets.reduce((acc, asset) => {
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

    // Zone distribution (tagged assets only)
    const zoneCounts = taggedAssets.reduce((acc, asset) => {
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

    // Asset type utilization breakdown (tagged assets only)
    const typeUtilization = taggedAssets.reduce((acc, asset) => {
      if (!acc[asset.type]) {
        acc[asset.type] = { total: 0, utilization: 0, underutilized: 0 }
      }
      acc[asset.type].total++
      acc[asset.type].utilization += asset.utilization
      if (asset.utilization < 40) acc[asset.type].underutilized++
      return acc
    }, {} as Record<string, { total: number, utilization: number, underutilized: number }>)

    const assetTypeUtilization = Object.entries(typeUtilization)
      .map(([type, typeData]) => ({
        type,
        avgUtilization: Math.round(typeData.utilization / typeData.total),
        totalAssets: typeData.total,
        underutilized: typeData.underutilized,
        utilizationRate: Math.round((typeData.total - typeData.underutilized) / typeData.total * 100)
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
        const lowDeptAssets = taggedAssets.filter(a => a.departmentId === lowDept.departmentId && a.utilization < 30)
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

    // Idle asset alerts (tagged assets only)
    const idleAssets = taggedAssets
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
        idleAssets,
        top10IdleAssets,
        utilizationTrend,
        maintenanceImpact,
        movementAlerts: recentMovements
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

