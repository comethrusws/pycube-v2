import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    // Calculate maintenance needs by asset category
    const categoryStats = data.assets.reduce((acc, asset) => {
      const category = asset.category || asset.type
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          maintenanceDue: 0,
          highRisk: 0,
          avgUtilization: 0,
          totalUtilization: 0
        }
      }
      
      acc[category].total++
      acc[category].totalUtilization += asset.utilization
      
      // Check if maintenance is due
      const maintenanceDue = new Date(asset.maintenanceDue) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      if (maintenanceDue || asset.status === "maintenance") {
        acc[category].maintenanceDue++
      }
      
      // High risk based on age, utilization, and status
      const ageInDays = asset.purchaseDate ? 
        Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (24 * 60 * 60 * 1000)) : 0
      const isHighRisk = ageInDays > 1095 || asset.utilization > 85 || asset.status === "maintenance"
      if (isHighRisk) {
        acc[category].highRisk++
      }
      
      return acc
    }, {} as Record<string, { total: number, maintenanceDue: number, highRisk: number, avgUtilization: number, totalUtilization: number }>)

    // Calculate averages and prepare response
    const categories = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        maintenanceDue: stats.maintenanceDue,
        highRisk: stats.highRisk,
        avgUtilization: Math.round(stats.totalUtilization / stats.total),
        maintenanceRate: Math.round((stats.maintenanceDue / stats.total) * 100),
        riskRate: Math.round((stats.highRisk / stats.total) * 100)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Summary stats
    const totalAssets = data.assets.length
    const totalMaintenanceDue = categories.reduce((sum, cat) => sum + cat.maintenanceDue, 0)
    const totalHighRisk = categories.reduce((sum, cat) => sum + cat.highRisk, 0)

    return NextResponse.json({
      summary: {
        totalCategories: categories.length,
        totalAssets,
        totalMaintenanceDue,
        totalHighRisk,
        avgMaintenanceRate: categories.length > 0 ? 
          Math.round(categories.reduce((sum, cat) => sum + cat.maintenanceRate, 0) / categories.length) : 0
      },
      categories
    })
  } catch (error) {
    console.error("Asset categories API error:", error)
    return NextResponse.json({ error: "Failed to load asset categories" }, { status: 500 })
  }
}
