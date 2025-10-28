import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const department = searchParams.get("department") || "all"
    const building = searchParams.get("building") || "all"
    const floor = searchParams.get("floor") || "all"
    const status = searchParams.get("status") || "all"
    const type = searchParams.get("type") || "all"

    const data = await loadSeedData()
    
    // Convert assets to mobile format with enhanced location data
    const mobileAssets = data.assets.map(asset => {
      const zone = data.zones.find(z => z.id === asset.location.zoneId)
      const floorObj = data.floors.find(f => f.id === zone?.floorId)
      const building = data.buildings.find(b => b.id === floorObj?.buildingId)
      const department = data.departments.find(d => d.id === asset.departmentId)
      
      // Generate coordinates based on asset ID for consistent positioning
      const assetIndex = parseInt(asset.id.slice(-3)) || 0
      const gridCols = 4
      const row = Math.floor(assetIndex / gridCols) % 3
      const col = assetIndex % gridCols
      
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        category: asset.category || asset.type,
        tagId: asset.tagId || `TAG-${asset.id.slice(-6)}`,
        status: asset.status,
        utilization: asset.utilization,
        lastActive: asset.lastActive,
        department: department?.name || `Department ${asset.departmentId.slice(-3)}`,
        departmentId: asset.departmentId,
        location: {
          building: building?.name || "Building 1",
          floor: floorObj?.name || "Floor 1", 
          zone: zone?.name || "Zone A",
          room: `Room ${zone?.name?.slice(-1) || 'A'}-${Math.floor(assetIndex / 10) + 1}`,
          coordinates: {
            x: 50 + (col * 100) + (assetIndex % 50),
            y: 50 + (row * 80) + (assetIndex % 30)
          }
        },
        maintenanceReadiness: asset.utilization > 70 ? "green" : asset.utilization > 40 ? "yellow" : "red",
        lastSeen: asset.lastActive,
        serialNumber: asset.serialNumber || `SN${asset.id.slice(-8)}`,
        value: asset.value || Math.floor(Math.random() * 50000) + 5000
      }
    })

    // Apply filters
    let filteredAssets = mobileAssets.filter(asset => {
      // Search query filter
      if (query && !asset.name.toLowerCase().includes(query.toLowerCase()) && 
          !asset.type.toLowerCase().includes(query.toLowerCase()) &&
          !asset.tagId.toLowerCase().includes(query.toLowerCase())) {
        return false
      }
      
      // Department filter
      if (department !== "all" && asset.department !== department) {
        return false
      }
      
      // Building filter  
      if (building !== "all" && asset.location.building !== building) {
        return false
      }
      
      // Floor filter
      if (floor !== "all" && asset.location.floor !== floor) {
        return false
      }
      
      // Status filter
      if (status !== "all" && asset.status !== status) {
        return false
      }
      
      // Type filter
      if (type !== "all" && asset.type !== type) {
        return false
      }
      
      return true
    })

    // Generate filter options from all assets
    const departments = [...new Set(mobileAssets.map(a => a.department))].sort()
    const buildings = [...new Set(mobileAssets.map(a => a.location.building))].sort()
    const floors = [...new Set(mobileAssets.map(a => a.location.floor))].sort()
    const types = [...new Set(mobileAssets.map(a => a.type))].sort()
    const statuses = ["available", "in-use", "maintenance", "lost"]

    return NextResponse.json({
      assets: filteredAssets,
      total: filteredAssets.length,
      filters: {
        departments,
        buildings,
        floors,
        types,
        statuses
      }
    })
  } catch (error) {
    console.error("Mobile asset search API error:", error)
    return NextResponse.json({ error: "Failed to search assets" }, { status: 500 })
  }
}
