import { loadSeedData } from "@/lib/data-loader"
import { NextRequest, NextResponse } from "next/server"
import { apiGet } from "@/lib/fetcher"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "week"

    // Create zone lookup map for better performance
    const zoneMap = new Map(data.zones.map((zone) => [zone.id, zone.name]))

    // Always compute data to ensure range changes are reflected
    const totalAssets = data.assets.length
    const taggedAssets = data.assets.filter((a) => a.tagId).length

    // Calculate utilization metrics
    const avgUtilization = Math.round(data.assets.reduce((sum, a) => sum + a.utilization, 0) / totalAssets)
    const underutilizedAssets = data.assets.filter(a => a.utilization < 40).length

    const stats = {
      totalAssets,
      totalFacilities: data.facilities.length,
      totalUsers: data.users.length,
      categories: [...new Set(data.assets.map((a) => a.category || a.type))].length,
      avgUtilization,
      underutilizedAssets,
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

    // Calculate visibility data based on range
    let recentPeriod: Date
    switch (range) {
      case "day":
        recentPeriod = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        break
      case "month":
        recentPeriod = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        break
      default: // week
        recentPeriod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    }

    const recentlyActive = data.assets.filter((a) => new Date(a.lastActive) > recentPeriod)

    const visibility = {
      scanned: recentlyActive.length,
      notScanned: totalAssets - recentlyActive.length,
      trend: generateVisibilityTrend(data.movementLogs, totalAssets, range),
    }

    // Real zones not scanned (zones with no recent movement based on selected range)
    const recentMovements = data.movementLogs.filter(
      (log) => new Date(log.timestamp) > recentPeriod
    )
    const scannedZoneIds = new Set(recentMovements.map((log) => log.toZoneId))
    const zonesNotScanned = data.zones
      .filter((zone) => !scannedZoneIds.has(zone.id))
      .map((zone) => zone.name)
      .slice(0, 6)

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

    // Department-level utilization analysis for dashboard
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

    // Top 5 Idle Assets for dashboard snippet
    const top5IdleAssets = data.assets
      .filter(a => a.utilization < 30 && a.status === "available")
      .sort((a, b) => a.utilization - b.utilization)
      .slice(0, 5)
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
      utilization: {
        departmentUtilization,
        top5IdleAssets
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 })
  }
}

// Helper function to generate visibility trend data
function generateVisibilityTrend(movementLogs: any[], totalAssets: number, range: string = "week") {
  const trend = []
  let periods: number
  let timeUnit: string
  let dateFormat: (date: Date) => string
  
  // Configure based on range
  switch (range) {
    case "day":
      periods = 24 // Last 24 hours by hour
      timeUnit = "hour"
      dateFormat = (date: Date) => {
        const hour = date.getHours().toString().padStart(2, '0')
        return `${hour}:00`
      }
      break
    case "month":
      periods = 30 // Last 30 days
      timeUnit = "day"
      dateFormat = (date: Date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${month}/${day}`
      }
      break
    default: // week
      periods = 7 // Last 7 days
      timeUnit = "day"
      dateFormat = (date: Date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${month}/${day}`
      }
  }

  for (let i = periods - 1; i >= 0; i--) {
    let periodStart: Date
    let periodEnd: Date
    
    if (timeUnit === "hour") {
      // For hourly data
      periodStart = new Date(Date.now() - i * 60 * 60 * 1000)
      periodStart = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate(), periodStart.getHours())
      periodEnd = new Date(periodStart.getTime() + 60 * 60 * 1000)
    } else {
      // For daily data
      periodStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      periodStart = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate())
      periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000)
    }

    // Filter movements for this time period
    const periodMovements = movementLogs.filter(log => {
      const logTime = new Date(log.timestamp)
      return logTime >= periodStart && logTime < periodEnd
    })
    
    // Calculate unique assets that moved during this period
    const actualScanned = new Set(periodMovements.map(log => log.assetId)).size
    
    // Generate realistic activity patterns
    let baseActivityRate = 0.12 // 12% base activity
    
    if (range === "day") {
      // Hourly variation - more activity during business hours
      const hour = periodStart.getHours()
      if (hour >= 6 && hour <= 18) {
        baseActivityRate = 0.15 + (Math.sin((hour - 6) * Math.PI / 12) * 0.08) // Peak around noon
      } else if (hour >= 19 && hour <= 23) {
        baseActivityRate = 0.08 + Math.random() * 0.04 // Evening activity
      } else {
        baseActivityRate = 0.03 + Math.random() * 0.02 // Night shift minimal activity
      }
    } else if (range === "week") {
      // Daily variation - less on weekends
      const dayOfWeek = periodStart.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseActivityRate = 0.06 + Math.random() * 0.04 // 6-10% on weekends
      } else {
        // Weekday pattern: Tuesday-Thursday busiest
        const weekdayMultiplier = [0.9, 1.0, 1.2, 1.2, 1.1, 0.8, 0.7][dayOfWeek]
        baseActivityRate = (0.12 + Math.random() * 0.08) * weekdayMultiplier
      }
    } else {
      // Monthly variation - some natural fluctuation
      const dayOfMonth = periodStart.getDate()
      // Slight increase mid-month, decrease at month-end
      const monthlyMultiplier = 1 + Math.sin((dayOfMonth / 30) * Math.PI) * 0.2
      baseActivityRate = (0.10 + Math.random() * 0.08) * monthlyMultiplier
    }
    
    // Combine actual data with realistic baseline
    const estimatedScanned = Math.max(
      actualScanned, 
      Math.floor(totalAssets * baseActivityRate)
    )
    
    const notScannedAssets = Math.max(0, totalAssets - estimatedScanned)

    trend.push({
      date: dateFormat(periodStart),
      scanned: estimatedScanned,
      notScanned: notScannedAssets,
      period: timeUnit === "hour" ? `${periodStart.getHours()}:00-${periodEnd.getHours()}:00` : dateFormat(periodStart)
    })
  }
  
  return trend
}

