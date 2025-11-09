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
          percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          count: completedTasks,
          color: "#059669"
        },
        { 
          status: "In Progress", 
          percentage: totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0,
          count: pendingTasks,
          color: "#0d7a8c"
        },
        { 
          status: "Overdue", 
          percentage: totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0,
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

    // Fallback: compute basic PM data on-demand using seed data (only tagged assets)
    const taggedAssets = data.assets.filter(a => a.tagId)
    const total = taggedAssets.length
    const tasks = data.maintenanceTasks.filter(t => {
      const asset = data.assets.find(a => a.id === t.assetId)
      return asset && asset.tagId
    })
    const completed = tasks.filter((t) => t.status === "completed").length
    const pending = tasks.filter((t) => t.status === "pending" || t.status === "in-progress").length
    const overdue = tasks.filter((t) => t.status === "overdue").length
    const totalTasks = tasks.length

    // Create collection status data that matches what the component expects
    const collectionStatus = [
      { 
        status: "Completed", 
        percentage: totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0,
        count: completed,
        color: "#059669"
      },
      { 
        status: "Pending", 
        percentage: totalTasks > 0 ? Math.round((pending / totalTasks) * 100) : 0,
        count: pending,
        color: "#0d7a8c"
      },
      { 
        status: "Overdue", 
        percentage: totalTasks > 0 ? Math.round((overdue / totalTasks) * 100) : 0,
        count: overdue,
        color: "#dc2626"
      }
    ].filter(item => item.count > 0)

    // Calculate risk distribution from tagged assets only
    const highRiskAssets = taggedAssets.filter(asset => {
      const ageInDays = asset.purchaseDate ? 
        Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (24 * 60 * 60 * 1000)) : 0
      return ageInDays > 1095 || asset.utilization > 85 || asset.status === "maintenance"
    }).length

    const mediumRiskAssets = taggedAssets.filter(asset => {
      const ageInDays = asset.purchaseDate ? 
        Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (24 * 60 * 60 * 1000)) : 0
      return (ageInDays > 730 && ageInDays <= 1095) || (asset.utilization > 60 && asset.utilization <= 85)
    }).length

    const lowRiskAssets = total - highRiskAssets - mediumRiskAssets

    return NextResponse.json({
      summary: {
        totalAssetsMonitored: total,
        highRiskAssets,
        mediumRiskAssets,
        lowRiskAssets,
        avgConfidenceScore: 78,
        potentialCostSavings: highRiskAssets * 2500 + mediumRiskAssets * 1200
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

