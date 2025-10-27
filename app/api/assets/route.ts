import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    return NextResponse.json({
      assets: data.assets,
      departments: data.departments,
      zones: data.zones,
      facilities: data.facilities,
      buildings: data.buildings,
      floors: data.floors
    })
  } catch (error) {
    console.error("Assets API error:", error)
    return NextResponse.json({ 
      assets: [],
      departments: [],
      zones: [],
      facilities: [],
      buildings: [],
      floors: []
    }, { status: 500 })
  }
}
