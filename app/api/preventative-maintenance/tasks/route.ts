import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET() {
  try {
    const data = await loadSeedData()
    
    return NextResponse.json({
      tasks: data.maintenanceTasks,
      assets: data.assets,
      users: data.users
    })
  } catch (error) {
    console.error("Maintenance tasks API error:", error)
    return NextResponse.json({ 
      tasks: [],
      assets: [],
      users: []
    }, { status: 500 })
  }
}
