import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { SeedData } from "@/lib/types"

async function getSeedData(): Promise<SeedData> {
  const seedPath = path.join(process.cwd(), "data", "seed.json")
  const seedJson = await fs.readFile(seedPath, "utf-8")
  return JSON.parse(seedJson)
}

export async function POST(request: Request) {
  const { prompt } = await request.json()
  const seedData = await getSeedData()

  let response: string

  switch (prompt) {
    case "Which assets are underutilized today?":
      const underutilizedAssets = seedData.assetLocatorData.utilization.top10IdleAssets
        .filter((a: any) => a.utilization < 30)
        .slice(0, 5)
      if (underutilizedAssets.length > 0) {
        const assetList = underutilizedAssets
          .map((a: any) => `- ${a.name} (Utilization: ${a.utilization}%) in ${a.department}`)
          .join("\n")
        response = `Here are some underutilized assets:\n${assetList}`
      } else {
        response = "No significantly underutilized assets found today."
      }
      break

    case "Recommend asset reallocations across departments.":
      const suggestions = seedData.assetLocatorData.utilization.redistributionSuggestions.slice(0, 2)
      if (suggestions.length > 0) {
        const suggestionList = suggestions
          .map(
            (s: any) =>
              `- Move ${s.assetName} from ${s.fromDepartment} to ${s.toDepartment}. Potential utilization increase: ${s.potentialImpact}`,
          )
          .join("\n")
        response = `Based on current utilization, here are some reallocation recommendations:\n${suggestionList}`
      } else {
        response = "No specific reallocation recommendations at this time."
      }
      break

    case "Show equipment that can be transferred to the ICU.":
      const icuDept = seedData.departments.find((d: any) => d.name.includes("ICU"))
      const otherDepts = seedData.departments.filter((d: any) => !d.name.includes("ICU"))

      if (icuDept) {
        const transferableAssets = seedData.assets
          .filter(
            (a: any) =>
              a.utilization < 40 &&
              a.status === "available" &&
              otherDepts.some((d: any) => d.id === a.departmentId) &&
              ["Infusion Pump", "Ventilator", "Patient Monitor"].includes(a.type),
          )
          .slice(0, 5)

        if (transferableAssets.length > 0) {
          const assetList = transferableAssets
            .map((a: any) => `- ${a.name} (currently in ${seedData.departments.find((d: any) => d.id === a.departmentId)?.name})`)
            .join("\n")
          response = `Here is some equipment that could be transferred to the ICU:\n${assetList}`
        } else {
          response = "No suitable equipment found for transfer to the ICU at the moment."
        }
      } else {
        response = "Could not find the ICU department."
      }
      break

    case "List assets nearing overuse or underuse thresholds.":
      const overused = seedData.assets.filter((a: any) => a.utilization > 90).slice(0, 3)
      const underused = seedData.assets.filter((a: any) => a.utilization < 15).slice(0, 3)

      let responseParts = []
      if (overused.length > 0) {
        responseParts.push(
          `Assets nearing overuse:\n${overused.map((a: any) => `- ${a.name} (${a.utilization}%)`).join("\n")}`,
        )
      }
      if (underused.length > 0) {
        responseParts.push(
          `Assets nearing underuse:\n${underused.map((a: any) => `- ${a.name} (${a.utilization}%)`).join("\n")}`,
        )
      }

      if (responseParts.length > 0) {
        response = responseParts.join("\n\n")
      } else {
        response = "No assets are currently nearing critical overuse or underuse thresholds."
      }
      break

    default:
      response = "I'm sorry, I don't understand that request. Please select one of the prompts below."
      break
  }

  return NextResponse.json({ response })
}
