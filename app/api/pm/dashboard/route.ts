import { NextResponse } from "next/server"
import { getStore } from "@/data/store"

export async function GET() {
  const store = getStore()
  const totalMonitored = store.assets.length
  const pendingTasks = store.maintenanceTasks.filter((t) => t.status === "pending").length
  const inProgress = store.maintenanceTasks.filter((t) => t.status === "in-progress").length
  const completed = store.maintenanceTasks.filter((t) => t.status === "completed").length

  const byCategory = Object.entries(
    store.assets.reduce<Record<string, { collected: number; pending: number }>>((acc, a) => {
      const key = a.type
      if (!acc[key]) acc[key] = { collected: 0, pending: 0 }
      // treat maintenance status as proxy for collected/pending
      const hasTask = store.maintenanceTasks.some((t) => t.assetId === a.id && t.status !== "completed")
      if (hasTask) acc[key].pending++
      else acc[key].collected++
      return acc
    }, {})
  ).map(([category, v]) => ({ category, ...v }))

  const trend = Array.from({ length: 6 }, (_, i) => {
    const collected = Math.round((completed / 6) * (i + 1))
    const pending = Math.max(0, Math.round((pendingTasks / 6) * (6 - i)))
    const date = new Date(Date.now() - (5 - i) * 7 * 86400000).toISOString().slice(0, 10)
    return { date, collected, pending }
  })

  return NextResponse.json({
    cards: {
      totalMonitored,
      pmPending: pendingTasks,
      pmInProgress: inProgress,
      pmCompleted: completed,
    },
    charts: {
      byCategory,
      trend,
    },
  })
}


