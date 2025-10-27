import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")
    
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    // Get upcoming maintenance tasks
    const upcomingTasks = data.maintenanceTasks
      .filter(task => {
        if (task.status !== "pending") return false
        const taskDate = new Date(task.scheduledDate)
        return taskDate >= now && taskDate <= futureDate
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    
    // Enhance tasks with asset and location information
    const enhancedTasks = upcomingTasks.map(task => {
      const asset = data.assets.find(a => a.id === task.assetId)
      const zone = asset ? data.zones.find(z => z.id === asset.location.zoneId) : null
      const assignedUser = data.users.find(u => u.id === task.assignedTo)
      
      return {
        id: task.id,
        assetId: task.assetId,
        assetName: asset?.name || "Unknown Asset",
        assetType: asset?.type || "Unknown",
        location: zone?.name || "Unknown Location",
        scheduledDate: task.scheduledDate,
        type: task.type || "maintenance",
        description: task.description || "",
        priority: task.priority || "medium",
        assignedTo: assignedUser?.name || "Unassigned",
        estimatedDuration: task.estimatedDuration || 60,
        cost: task.cost || 0,
        daysUntil: Math.ceil((new Date(task.scheduledDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      }
    })
    
    // Group by time periods
    const today = enhancedTasks.filter(task => task.daysUntil === 0)
    const thisWeek = enhancedTasks.filter(task => task.daysUntil > 0 && task.daysUntil <= 7)
    const nextWeek = enhancedTasks.filter(task => task.daysUntil > 7 && task.daysUntil <= 14)
    const later = enhancedTasks.filter(task => task.daysUntil > 14)
    
    // Priority breakdown with safe defaults
    const byPriority = {
      critical: enhancedTasks.filter(task => task.priority === "critical").length,
      high: enhancedTasks.filter(task => task.priority === "high").length,
      medium: enhancedTasks.filter(task => task.priority === "medium").length,
      low: enhancedTasks.filter(task => task.priority === "low").length
    }
    
    // Type breakdown with null safety
    const typeStats = enhancedTasks.reduce((acc, task) => {
      const taskType = task.type || "maintenance"
      acc[taskType] = (acc[taskType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byType = Object.entries(typeStats).map(([type, count]) => ({ type, count }))
    
    // Cost estimation
    const totalCost = enhancedTasks.reduce((sum, task) => sum + (task.cost || 0), 0)
    const avgCost = enhancedTasks.length > 0 ? Math.round(totalCost / enhancedTasks.length) : 0
    
    return NextResponse.json({
      summary: {
        total: enhancedTasks.length,
        today: today.length,
        thisWeek: thisWeek.length,
        nextWeek: nextWeek.length,
        later: later.length,
        totalCost,
        avgCost,
        avgDuration: enhancedTasks.length > 0 ? 
          Math.round(enhancedTasks.reduce((sum, task) => sum + task.estimatedDuration, 0) / enhancedTasks.length) : 0
      },
      groupedTasks: {
        today,
        thisWeek,
        nextWeek,
        later
      },
      breakdown: {
        byPriority,
        byType
      },
      tasks: enhancedTasks.slice(0, 50) // Limit to 50 for performance
    })
  } catch (error) {
    console.error("Upcoming maintenance API error:", error)
    return NextResponse.json({ error: "Failed to load upcoming maintenance" }, { status: 500 })
  }
}
