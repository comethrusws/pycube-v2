import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const name = searchParams.get("name") || ""
    const location = searchParams.get("location") || ""
    const status = searchParams.get("status") || ""

    let filtered = data.facilities || []

    // Apply filters
    if (name) {
      filtered = filtered.filter(facility => facility.name.toLowerCase().includes(name.toLowerCase()))
    }
    if (location) {
      filtered = filtered.filter(facility => facility.location.toLowerCase().includes(location.toLowerCase()))
    }
    if (status) {
      // For now, we'll assign random statuses since the seed data doesn't have this field
      filtered = filtered.filter(() => Math.random() > 0.3) // Filter some out to simulate status filtering
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedData = filtered.slice(offset, offset + limit)

    // Enrich data with additional information
    const enrichedData = paginatedData.map(facility => {
      const facilityDepartments = data.departments.filter(d => d.facilityId === facility.id)
      const facilityBuildings = data.buildings.filter(b => b.facilityId === facility.id)
      const facilityUsers = data.users.filter(u => {
        const userDept = data.departments.find(d => d.id === u.departmentId)
        return userDept?.facilityId === facility.id
      })
      const facilityAssets = data.assets.filter(a => {
        const assetDept = data.departments.find(d => d.id === a.departmentId)
        return assetDept?.facilityId === facility.id
      })
      
      // Simulate status (since not in seed data)
      const statusOptions = ["active", "inactive", "maintenance"]
      const simulatedStatus = statusOptions[facility.id.length % statusOptions.length]
      
      return {
        id: facility.id,
        name: facility.name,
        location: facility.location,
        departments: facilityDepartments,
        buildings: facilityBuildings,
        totalDepartments: facilityDepartments.length,
        totalBuildings: facilityBuildings.length,
        totalUsers: facilityUsers.length,
        totalAssets: facilityAssets.length,
        createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: simulatedStatus
      }
    })

    return NextResponse.json({
      facilities: enrichedData,
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
    console.error("Facilities list API error:", error)
    return NextResponse.json({ error: "Failed to load facilities" }, { status: 500 })
  }
}
