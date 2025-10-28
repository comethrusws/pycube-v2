import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get("q") || ""
    const department = searchParams.get("department") || ""
    const floor = searchParams.get("floor") || ""
    const status = searchParams.get("status") || ""
    const type = searchParams.get("type") || ""
    const building = searchParams.get("building") || ""
    
    let filtered = data.assets || []

    // Apply search query filter
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(lowerQuery) ||
        asset.type.toLowerCase().includes(lowerQuery) ||
        asset.tagId.toLowerCase().includes(lowerQuery) ||
        asset.id.toLowerCase().includes(lowerQuery)
      )
    }

    // Apply department filter
    if (department && department !== "all") {
      filtered = filtered.filter(asset => {
        const dept = data.departments.find(d => d.id === asset.departmentId)
        return dept?.name.toLowerCase().includes(department.toLowerCase())
      })
    }

    // Apply status filter
    if (status && status !== "all") {
      filtered = filtered.filter(asset => asset.status === status)
    }

    // Apply type filter
    if (type && type !== "all") {
      filtered = filtered.filter(asset => asset.type.toLowerCase().includes(type.toLowerCase()))
    }

    // Apply location filters
    if (building || floor) {
      filtered = filtered.filter(asset => {
        const zone = data.zones.find(z => z.id === asset.location.zoneId)
        const assetFloor = data.floors.find(f => f.id === zone?.floorId)
        const assetBuilding = data.buildings.find(b => b.id === assetFloor?.buildingId)
        
        if (building && building !== "all" && assetBuilding?.name !== building) return false
        if (floor && floor !== "all" && assetFloor?.name !== floor) return false
        return true
      })
    }

    // Enrich data with location information and maintenance readiness
    const enrichedAssets = filtered.map(asset => {
      const zone = data.zones.find(z => z.id === asset.location.zoneId)
      const floor = data.floors.find(f => f.id === zone?.floorId)
      const building = data.buildings.find(b => b.id === floor?.buildingId)
      const department = data.departments.find(d => d.id === asset.departmentId)
      
      // Calculate maintenance readiness
      const overdueMaintenance = data.maintenanceTasks.some(
        task => task.assetId === asset.id && task.status === "overdue"
      )
      const upcomingMaintenance = data.maintenanceTasks.some(
        task => task.assetId === asset.id && 
        task.status === "pending" && 
        new Date(task.scheduledDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      )
      
      const maintenanceReadiness = overdueMaintenance ? "red" : upcomingMaintenance ? "yellow" : "green"
      
      // Generate mock coordinates for map display
      const baseX = 100 + (parseInt(asset.id.slice(-3)) % 300)
      const baseY = 100 + (parseInt(asset.id.slice(-2)) % 200)
      
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        category: asset.category || asset.type,
        tagId: asset.tagId,
        status: asset.status,
        utilization: asset.utilization,
        lastActive: asset.lastActive,
        department: department?.name || "Unknown Department",
        departmentId: asset.departmentId,
        location: {
          building: building?.name || "Unknown Building",
          floor: floor?.name || "Unknown Floor", 
          zone: zone?.name || "Unknown Zone",
          room: `Room ${zone?.name?.slice(-3) || "000"}`,
          coordinates: { x: baseX, y: baseY }
        },
        maintenanceReadiness,
        lastSeen: asset.lastActive,
        serialNumber: asset.serialNumber,
        value: asset.value
      }
    })

    // Sort by relevance (exact matches first, then by name)
    if (query) {
      enrichedAssets.sort((a, b) => {
        const aExactMatch = a.name.toLowerCase() === query.toLowerCase() || a.tagId.toLowerCase() === query.toLowerCase()
        const bExactMatch = b.name.toLowerCase() === query.toLowerCase() || b.tagId.toLowerCase() === query.toLowerCase()
        
        if (aExactMatch && !bExactMatch) return -1
        if (!aExactMatch && bExactMatch) return 1
        return a.name.localeCompare(b.name)
      })
    }

    return NextResponse.json({
      assets: enrichedAssets.slice(0, 50), // Limit to 50 results for mobile performance
      total: enrichedAssets.length,
      filters: {
        departments: [...new Set(data.departments.map(d => d.name))].sort(),
        buildings: [...new Set(data.buildings.map(b => b.name))].sort(),
        floors: [...new Set(data.floors.map(f => f.name))].sort(),
        types: [...new Set(data.assets.map(a => a.type))].sort(),
        statuses: ["available", "in-use", "maintenance", "lost"]
      }
    })
  } catch (error) {
    console.error("Mobile asset search API error:", error)
    return NextResponse.json({ error: "Failed to search assets" }, { status: 500 })
  }
}
