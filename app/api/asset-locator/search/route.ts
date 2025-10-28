import { NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").toLowerCase()
    
    const data = await loadSeedData()
    
    const results = data.assets
      .filter((a) => 
        a.name.toLowerCase().includes(q) || 
        (a.tagId && a.tagId.toLowerCase().includes(q)) ||
        a.type.toLowerCase().includes(q)
      )
      .slice(0, 100)
      .map((a) => {
        const zone = data.zones.find(z => z.id === a.location.zoneId)
        const floor = data.floors.find(f => f.id === zone?.floorId)
        const building = data.buildings.find(b => b.id === floor?.buildingId)
        
        return {
          id: a.id,
          name: a.name,
          tagId: a.tagId || `TAG-${a.id.slice(-6)}`,
          status: a.status,
          location: {
            zoneName: zone?.name || "Unknown Zone",
            floorName: floor?.name || "Unknown Floor",
            buildingName: building?.name || "Unknown Building"
          }
        }
      })
      
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Asset locator search API error:", error)
    return NextResponse.json({ error: "Failed to search assets" }, { status: 500 })
  }
}

