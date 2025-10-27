import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    if (data.predictiveMaintenanceData) {
      return NextResponse.json(data.predictiveMaintenanceData)
    }

    // Fallback empty structure if no predictive data
    return NextResponse.json({
      summary: {
        totalAssetsMonitored: 0,
        highRiskAssets: 0,
        mediumRiskAssets: 0,
        lowRiskAssets: 0,
        avgConfidenceScore: 0,
        potentialCostSavings: 0
      },
      insights: [],
      top5AtRisk: [],
      riskDistribution: [],
      degradationTrends: [],
      predictionAccuracy: []
    })
  } catch (error) {
    console.error("Predictive maintenance API error:", error)
    return NextResponse.json({ 
      summary: {
        totalAssetsMonitored: 0,
        highRiskAssets: 0,
        mediumRiskAssets: 0,
        lowRiskAssets: 0,
        avgConfidenceScore: 0,
        potentialCostSavings: 0
      },
      insights: [],
      top5AtRisk: [],
      riskDistribution: [],
      degradationTrends: [],
      predictionAccuracy: []
    }, { status: 500 })
  }
}
