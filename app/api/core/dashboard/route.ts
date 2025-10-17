import { NextResponse } from "next/server"
import { getStore } from "@/data/store"

export async function GET() {
  const store = getStore()
  const totalAssets = store.assets.length
  const utilizationPct = Math.round(
    (store.assets.reduce((acc, a) => acc + a.utilization, 0) / (totalAssets * 100)) * 100
  )
  const underMaintenance = store.assets.filter((a) => a.status === "maintenance").length
  const recentMovements = store.movementLogs.slice(-25)
  const recentMaintenance = store.maintenanceTasks.slice(-25)

  return NextResponse.json({
    stats: {
      totalAssets,
      utilizationPct,
      underMaintenance,
      facilities: store.facilities.length,
      users: store.users.length,
    },
    charts: {
      byType: Object.entries(
        store.assets.reduce<Record<string, number>>((acc, a) => {
          acc[a.type] = (acc[a.type] || 0) + 1
          return acc
        }, {})
      ).map(([type, count]) => ({ type, count })),
    },
    recent: {
      movements: recentMovements,
      maintenance: recentMaintenance,
    },
  })
}


