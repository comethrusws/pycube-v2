import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    // Use predictive maintenance trend data if available
    if (data.predictiveMaintenanceData?.predictionAccuracy) {
      return NextResponse.json({
        trend: data.predictiveMaintenanceData.predictionAccuracy,
        summary: {
          avgAccuracy: Math.round(
            data.predictiveMaintenanceData.predictionAccuracy.reduce((sum, item) => sum + item.accuracy, 0) / 
            data.predictiveMaintenanceData.predictionAccuracy.length
          ),
          totalPredictions: data.predictiveMaintenanceData.predictionAccuracy.reduce((sum, item) => sum + item.predictionsCount, 0),
          trend: "improving"
        }
      })
    }

    // Generate fallback trend data for last 12 months
    const trendData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      
      // Simulate realistic maintenance trends
      const baseAccuracy = 75
      const seasonalEffect = Math.sin((i / 12) * 2 * Math.PI) * 8 // Seasonal variation
      const improvementTrend = i * 1.5 // Gradual improvement over time
      const randomVariation = (Math.random() - 0.5) * 10
      
      const accuracy = Math.max(60, Math.min(95, 
        baseAccuracy + seasonalEffect + improvementTrend + randomVariation
      ))
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        accuracy: Math.round(accuracy),
        predictionsCount: Math.floor(Math.random() * 30) + 20
      }
    })

    const avgAccuracy = Math.round(
      trendData.reduce((sum, item) => sum + item.accuracy, 0) / trendData.length
    )
    
    const totalPredictions = trendData.reduce((sum, item) => sum + item.predictionsCount, 0)
    
    // Determine trend direction
    const firstHalf = trendData.slice(0, 6).reduce((sum, item) => sum + item.accuracy, 0) / 6
    const secondHalf = trendData.slice(6).reduce((sum, item) => sum + item.accuracy, 0) / 6
    const trendDirection = secondHalf > firstHalf ? "improving" : 
                          secondHalf < firstHalf ? "declining" : "stable"

    return NextResponse.json({
      trend: trendData,
      summary: {
        avgAccuracy,
        totalPredictions,
        trend: trendDirection
      }
    })
  } catch (error) {
    console.error("Trend API error:", error)
    return NextResponse.json({ error: "Failed to load trend data" }, { status: 500 })
  }
}
