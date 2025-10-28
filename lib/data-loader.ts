import { readFileSync } from "fs"
import { join } from "path"
import type { SeedData } from "./types"

let cachedData: SeedData | null = null

export async function loadSeedData(): Promise<SeedData> {
  if (cachedData) {
    return cachedData
  }

  try {
    const seedPath = join(process.cwd(), "data", "seed.json")
    console.log("Loading seed data from:", seedPath)
    const rawData = readFileSync(seedPath, "utf-8")
    cachedData = JSON.parse(rawData) as SeedData
    console.log("Seed data loaded successfully:", {
      assets: cachedData.assets.length,
      zones: cachedData.zones.length,
      users: cachedData.users.length,
      facilities: cachedData.facilities.length,
      predictiveInsights: cachedData.predictiveMaintenanceData?.insights.length || 0
    })
    return cachedData
  } catch (error) {
    console.error("Failed to load seed data:", error)
    console.log("Make sure to run: npm run seed to generate the data first")
    
    // Return minimal fallback data structure
    return {
      facilities: [],
      departments: [],
      buildings: [],
      floors: [],
      zones: [],
      readers: [],
      userGroups: [],
      users: [],
      pointsOfContact: [],
      products: [],
      productCategories: [],
      assets: [],
      userLogs: [],
      movementLogs: [],
      maintenanceTasks: [],
      maintenanceRequests: [],
      alerts: [],
      userUtilizations: [],
      locationLists: [],
      locationActivities: [],
      complianceData: {
        summary: {
          overallScore: 0,
          totalAssets: 0,
          fullyCompliant: 0,
          overdueMaintenance: 0,
          recallActions: 0,
          averageRiskScore: 0,
          riskByDepartment: [],
          noncomplianceTrend: []
        },
        assetRisks: []
      },
      predictiveMaintenanceData: {
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
      }
    }
  }
}

export function clearCache() {
  cachedData = null
  console.log("Seed data cache cleared")
}
