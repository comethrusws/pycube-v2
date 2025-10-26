import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    const totalAssets = data.assets.length
    const maintenanceTasks = data.maintenanceTasks
    const collected = maintenanceTasks.filter((t) => t.status === "completed").length
    const pending = maintenanceTasks.filter((t) => t.status === "pending" || t.status === "overdue").length
    const pendingCollection = maintenanceTasks.filter((t) => t.status === "pending").length

    return NextResponse.json({
      stats: {
        totalMonitoredAssets: totalAssets,
        pmPending: pending,
        pmCollected: collected,
        assetsPendingCollection: pendingCollection,
      },
      charts: {
        collectionStatus: [
          { name: "Collected", value: Math.round((collected / (collected + pending)) * 100), fill: "#0d7a8c" },
          { name: "Pending", value: Math.round((pending / (collected + pending)) * 100), fill: "#c41e3a" },
        ],
        // Add more chart data as needed
      },
    })
  } catch (error) {
    console.error("Preventative maintenance dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load preventative maintenance data" }, { status: 500 })
  }
}
