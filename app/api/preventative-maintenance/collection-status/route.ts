import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    // Use predictive maintenance data if available
    if (data.predictiveMaintenanceData) {
      const { insights } = data.predictiveMaintenanceData
      
      // Collection status based on predictive insights
      const totalMonitored = insights.length
      const collecting = insights.filter(i => i.keyIndicators.usageHours > 0).length
      const notCollecting = totalMonitored - collecting
      const issues = insights.filter(i => i.riskLevel === "high").length
      
      return NextResponse.json({
        stats: {
          totalMonitored,
          collecting,
          notCollecting,
          issues,
          collectionRate: Math.round((collecting / totalMonitored) * 100)
        },
        details: {
          byRisk: [
            { name: "High Risk", count: insights.filter(i => i.riskLevel === "high").length, color: "#dc2626" },
            { name: "Medium Risk", count: insights.filter(i => i.riskLevel === "medium").length, color: "#ea580c" },
            { name: "Low Risk", count: insights.filter(i => i.riskLevel === "low").length, color: "#059669" }
          ],
          recentIssues: insights
            .filter(i => i.riskLevel === "high")
            .slice(0, 5)
            .map(insight => ({
              assetId: insight.assetId,
              assetName: insight.assetName,
              issue: insight.predictedIssue,
              severity: insight.riskLevel,
              timestamp: insight.createdAt
            }))
        }
      })
    }

    // Fallback computation
    const totalAssets = data.assets.length
    const monitoredAssets = Math.floor(totalAssets * 0.8)
    const collectingAssets = Math.floor(monitoredAssets * 0.85)
    const notCollectingAssets = monitoredAssets - collectingAssets
    const issueAssets = Math.floor(monitoredAssets * 0.12)

    return NextResponse.json({
      stats: {
        totalMonitored: monitoredAssets,
        collecting: collectingAssets,
        notCollecting: notCollectingAssets,
        issues: issueAssets,
        collectionRate: Math.round((collectingAssets / monitoredAssets) * 100)
      },
      details: {
        byRisk: [
          { name: "High Risk", count: Math.floor(monitoredAssets * 0.08), color: "#dc2626" },
          { name: "Medium Risk", count: Math.floor(monitoredAssets * 0.25), color: "#ea580c" },
          { name: "Low Risk", count: Math.floor(monitoredAssets * 0.67), color: "#059669" }
        ],
        recentIssues: []
      }
    })
  } catch (error) {
    console.error("Collection status API error:", error)
    return NextResponse.json({ error: "Failed to load collection status" }, { status: 500 })
  }
}
