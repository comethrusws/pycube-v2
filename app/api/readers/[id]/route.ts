import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(
  _request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const data = await loadSeedData()
    const reader = (data.readers || []).find((r: any) => r.id === id)
    if (!reader) {
      return NextResponse.json({ error: "Reader not found" }, { status: 404 })
    }

    const zone = data.zones.find((z: any) => z.id === reader.zoneId)
    const floor = data.floors.find((f: any) => f.id === zone?.floorId)
    const building = data.buildings.find((b: any) => b.id === floor?.buildingId)

    // Assets and readers colocated in the same zone for context
    const assetsInZone = (data.assets || []).filter((a: any) => a.location?.zoneId === reader.zoneId).slice(0, 20)
    const siblingReaders = (data.readers || []).filter((r: any) => r.zoneId === reader.zoneId && r.id !== id)

    return NextResponse.json({
      reader: {
        ...reader,
        zoneName: zone?.name || "Unknown Zone",
        floorName: floor?.name || "Unknown Floor",
        buildingName: building?.name || "Unknown Building",
      },
      location: { zone, floor, building },
      assetsInZone: assetsInZone.map((a: any) => ({ id: a.id, name: a.name, type: a.type, status: a.status })),
      siblingReaders: siblingReaders.map((r: any) => ({ id: r.id, name: r.name, status: r.status })),
    })
  } catch (error) {
    console.error("Reader details API error:", error)
    return NextResponse.json({ error: "Failed to load reader" }, { status: 500 })
  }
}