import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    // Get pending maintenance tasks
    const pendingTasks = data.maintenanceTasks.filter(task => 
      task.status === "pending" || task.status === "overdue"
    )
    
    // Group by location (zone)
    const locationStats = pendingTasks.reduce((acc, task) => {
      const asset = data.assets.find(a => a.id === task.assetId)
      if (!asset) return acc
      
      const zone = data.zones.find(z => z.id === asset.location.zoneId)
      const zoneName = zone?.name || "Unknown Location"
      
      if (!acc[zoneName]) {
        acc[zoneName] = {
          pending: 0,
          overdue: 0,
          total: 0,
          highPriority: 0,
          assets: new Set()
        }
      }
      
      acc[zoneName].total++
      acc[zoneName].assets.add(asset.id)
      
      if (task.status === "overdue") {
        acc[zoneName].overdue++
      } else {
        acc[zoneName].pending++
      }
      
      if (task.priority === "high" || task.priority === "critical") {
        acc[zoneName].highPriority++
      }
      
      return acc
    }, {} as Record<string, { pending: number, overdue: number, total: number, highPriority: number, assets: Set<string> }>)
    
    // Convert to array and sort by priority
    const locations = Object.entries(locationStats)
      .map(([name, stats]) => ({
        location: name,
        pending: stats.pending,
        overdue: stats.overdue,
        total: stats.total,
        highPriority: stats.highPriority,
        uniqueAssets: stats.assets.size,
        urgencyScore: (stats.overdue * 3) + (stats.highPriority * 2) + stats.pending
      }))
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 15) // Top 15 locations
    
    // Calculate summary statistics
    const totalPending = locations.reduce((sum, loc) => sum + loc.pending, 0)
    const totalOverdue = locations.reduce((sum, loc) => sum + loc.overdue, 0)
    const totalHighPriority = locations.reduce((sum, loc) => sum + loc.highPriority, 0)
    
    return NextResponse.json({
      summary: {
        totalLocations: locations.length,
        totalPending,
        totalOverdue,
        totalHighPriority,
        criticalLocations: locations.filter(loc => loc.overdue > 0 || loc.highPriority > 2).length
      },
      locations
    })
  } catch (error) {
    console.error("Pending by location API error:", error)
    return NextResponse.json({ error: "Failed to load location data" }, { status: 500 })
  }
}
