import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await loadSeedData()
    const compliance = data.complianceData
    if (!compliance) return NextResponse.json({ error: "No compliance data" }, { status: 404 })

    // Filter by optional params
    const { startDate, endDate, departmentId, assetType } = body || {}
    let assetRisks = compliance.assetRisks

    if (departmentId) {
      assetRisks = assetRisks.filter(r => r.departmentId === departmentId)
    }
    if (assetType) {
      // map assetId -> asset type
      const assetTypeMap = new Map(data.assets.map(a => [a.id, a.type]))
      assetRisks = assetRisks.filter(r => assetTypeMap.get(r.assetId) === assetType)
    }

    // Trend range filtering is simulated; our trend is last 30 days
    const summary = {
      ...compliance.summary,
      noncomplianceTrend: compliance.summary.noncomplianceTrend.filter(pt => {
        if (!startDate && !endDate) return true
        const t = new Date(pt.date).getTime()
        const s = startDate ? new Date(startDate).getTime() : -Infinity
        const e = endDate ? new Date(endDate).getTime() : Infinity
        return t >= s && t <= e
      })
    }

    const report = {
      filters: { startDate, endDate, departmentId, assetType },
      summary,
      stats: {
        totalAssets: data.assets.length,
        fullyCompliant: assetRisks.filter(r => r.riskScore >= 90 && !r.recallFlag && r.missedMaintenance === 0 && r.overdueCalibration === 0).length,
        overdueMaintenance: data.maintenanceTasks.filter(t => t.status === "overdue").length,
        recallActions: new Set(data.alerts.filter(a => a.type === "maintenance").map(a => a.assetId)).size,
        averageRiskScore: Math.round(assetRisks.reduce((s, r) => s + r.riskScore, 0) / Math.max(1, assetRisks.length))
      },
      assetRisks
    }

    // Persist JSON report to disk under data/reports
    const reportsDir = join(process.cwd(), "data", "reports")
    if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true })
    const id = `CR-${Date.now()}`
    const filePath = join(reportsDir, `${id}.json`)
    writeFileSync(filePath, JSON.stringify(report), { encoding: "utf-8" })

    return NextResponse.json({ id, ...report })
  } catch (error) {
    console.error("Compliance report API error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}


