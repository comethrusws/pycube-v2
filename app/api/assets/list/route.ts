import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const name = searchParams.get("name") || ""
    const type = searchParams.get("type") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""
    const department = searchParams.get("department") || ""

    let filtered = data.assets || []

    // Apply filters
    if (name) {
      filtered = filtered.filter(asset => asset.name.toLowerCase().includes(name.toLowerCase()))
    }
    if (type) {
      filtered = filtered.filter(asset => asset.type.toLowerCase().includes(type.toLowerCase()))
    }
    if (category) {
      filtered = filtered.filter(asset => asset.category?.toLowerCase().includes(category.toLowerCase()))
    }
    if (status) {
      filtered = filtered.filter(asset => asset.status === status)
    }
    if (department) {
      filtered = filtered.filter(asset => {
        const dept = data.departments.find(d => d.id === asset.departmentId)
        return dept?.name.toLowerCase().includes(department.toLowerCase())
      })
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedData = filtered.slice(offset, offset + limit)

    // Enrich data with additional information
    const enrichedData = paginatedData.map(asset => {
      const zone = data.zones.find(z => z.id === asset.location.zoneId)
      const building = data.buildings.find(b => b.id === zone?.buildingId)
      const floor = data.floors.find(f => f.id === zone?.floorId)
      const department = data.departments.find(d => d.id === asset.departmentId)
      
      return {
        ...asset,
        location: {
          ...asset.location,
          zoneName: zone?.name || "Unknown Zone",
          buildingName: building?.name || "Unknown Building",
          floorName: floor?.name || "Unknown Floor"
        },
        departmentName: department?.name || "Unknown Department"
      }
    })

    return NextResponse.json({
      assets: enrichedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error("Assets list API error:", error)
    return NextResponse.json({ error: "Failed to load assets" }, { status: 500 })
  }
}
