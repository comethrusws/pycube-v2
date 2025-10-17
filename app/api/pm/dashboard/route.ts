import { NextResponse } from "next/server"
import { loadData } from "../../../../lib/data"

export async function GET() {
  const data = loadData()
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
  return NextResponse.json({
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
}

