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
    const rawData = readFileSync(seedPath, "utf-8")
    cachedData = JSON.parse(rawData) as SeedData
    return cachedData
  } catch (error) {
    console.error("Failed to load seed data:", error)
    
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
      assets: [],
      userLogs: [],
      movementLogs: [],
      maintenanceTasks: [],
      alerts: [],
      userUtilizations: [],
    }
  }
}

export function clearCache() {
  cachedData = null
}
