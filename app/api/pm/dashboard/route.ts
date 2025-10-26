import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    if (data.predictiveMaintenanceData) {
      // Use pre-computed predictive maintenance data if available
      return NextResponse.json(data.predictiveMaintenanceData)
    }

    // Fallback: compute basic PM data on-demand
    const total = data.assets.length
    const tasks = data.maintenanceTasks
    const collected = tasks.filter((t) => t.status === "completed").length
    const pending = tasks.filter((t) => t.status !== "completed").length
    const upcomingQuarter = data.assets.filter((a) => {
      const due = new Date(a.maintenanceDue)
      const now = new Date()
      const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      return due > now && due <= in90
    }).length

    // Create collection status data that matches what the component expects
    const collectedPercentage = Math.round((collected / (collected + pending)) * 100)
    const pendingPercentage = 100 - collectedPercentage

    return NextResponse.json({
      summary: {
        totalAssetsMonitored: total,
        highRiskAssets: Math.floor(total * 0.15),
        mediumRiskAssets: Math.floor(total * 0.25),
        lowRiskAssets: Math.floor(total * 0.6),
        avgConfidenceScore: 78,
        potentialCostSavings: 125000
      },
      collectionStatus: [
        { 
          status: "Collected", 
          percentage: collectedPercentage,
          count: collected 
        },
        { 
          status: "Pending", 
          percentage: pendingPercentage,
          count: pending 
        }
      ],
      stats: {
        totalMonitoredAssets: total,
        pmPending: pending,
        pmCollected: collected,
        assetsPendingCollection: pending,
      },
      charts: {
        collectionStatus: [
          { name: "Collected", value: collected, fill: "#0d7a8c" },
          { name: "Pending", value: pending, fill: "#c41e3a" },
        ],
        upcomingQuarter,
      },
    })
  } catch (error) {
    console.error("PM Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load PM data" }, { status: 500 })
  }
}

