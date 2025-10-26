import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    if (data.predictiveMaintenanceData) {
      // Use pre-computed predictive maintenance data if available
      const pmData = data.predictiveMaintenanceData
      
      // Calculate collection status based on predictive insights and maintenance tasks
      const totalTasks = data.maintenanceTasks.length
      const completedTasks = data.maintenanceTasks.filter(t => t.status === "completed").length
      const pendingTasks = data.maintenanceTasks.filter(t => 
        t.status === "pending" || t.status === "in-progress"
      ).length
      const overdueTasks = data.maintenanceTasks.filter(t => t.status === "overdue").length
      
      // Enhanced collection status with proper percentages
      const collectionStatus = [
        { 
          status: "Completed", 
          percentage: Math.round((completedTasks / totalTasks) * 100),
          count: completedTasks,
          color: "#059669"
        },
        { 
          status: "In Progress", 
          percentage: Math.round((pendingTasks / totalTasks) * 100),
          count: pendingTasks,
          color: "#0d7a8c"
        },
        { 
          status: "Overdue", 
          percentage: Math.round((overdueTasks / totalTasks) * 100),
          count: overdueTasks,
          color: "#dc2626"
        }
      ].filter(item => item.count > 0) // Only show non-zero categories

      return NextResponse.json({
        ...pmData,
        collectionStatus,
        stats: {
          totalMonitoredAssets: pmData.summary.totalAssetsMonitored,
          pmPending: pendingTasks + overdueTasks,
          pmCollected: completedTasks,
          assetsPendingCollection: pendingTasks,
          pmOverdue: overdueTasks
        },
        charts: {
          collectionStatus: collectionStatus.map(item => ({
            name: item.status,
            value: item.count,
            percentage: item.percentage,
            fill: item.color
          }))
        }
      })
    }

    // Fallback: compute basic PM data on-demand
    const total = data.assets.length
    const tasks = data.maintenanceTasks
    const completed = tasks.filter((t) => t.status === "completed").length
    const pending = tasks.filter((t) => t.status === "pending" || t.status === "in-progress").length
    const overdue = tasks.filter((t) => t.status === "overdue").length

    // Create collection status data that matches what the component expects
    const collectionStatus = [
      { 
        status: "Completed", 
        percentage: Math.round((completed / tasks.length) * 100),
        count: completed,
        color: "#059669"
      },
      { 
        status: "Pending", 
        percentage: Math.round((pending / tasks.length) * 100),
        count: pending,
        color: "#0d7a8c"
      },
      { 
        status: "Overdue", 
        percentage: Math.round((overdue / tasks.length) * 100),
        count: overdue,
        color: "#dc2626"
      }
    ].filter(item => item.count > 0)

    return NextResponse.json({
      summary: {
        totalAssetsMonitored: total,
        highRiskAssets: Math.floor(total * 0.15),
        mediumRiskAssets: Math.floor(total * 0.25),
        lowRiskAssets: Math.floor(total * 0.6),
        avgConfidenceScore: 78,
        potentialCostSavings: 125000
      },
      collectionStatus,
      stats: {
        totalMonitoredAssets: total,
        pmPending: pending + overdue,
        pmCollected: completed,
        assetsPendingCollection: pending,
        pmOverdue: overdue
      },
      charts: {
        collectionStatus: collectionStatus.map(item => ({
          name: item.status,
          value: item.count,
          percentage: item.percentage,
          fill: item.color
        }))
      }
    })
  } catch (error) {
    console.error("PM Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load PM data" }, { status: 500 })
  }
}

