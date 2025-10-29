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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50) // Max 50 per request

    const data = await loadSeedData()
    
    // Convert only necessary assets to mobile format (optimize memory usage)
    const allAssets = data.assets
    
    // Apply filters first to reduce processing
    let filteredAssetIds = allAssets.filter(asset => {
      // Quick filter by IDs first for performance
      const zone = data.zones.find(z => z.id === asset.location.zoneId)
      if (!zone) return false; // Ensure zone exists
      const floorObj = data.floors.find(f => f.id === zone?.floorId)
      if (!floorObj) return false; // Ensure floor exists
      const buildingObj = data.buildings.find(b => b.id === floorObj?.buildingId)
      if (!buildingObj) return false; // Ensure building exists
      const departmentObj = data.departments.find(d => d.id === asset.departmentId)
      if (!departmentObj) return false; // Ensure department exists
      
      // Search query filter
      if (query) {
        const searchLower = query.toLowerCase()
        const tagId = asset.tagId || `TAG-${asset.id.slice(-6)}`
        if (!asset.name.toLowerCase().includes(searchLower) && 
            !asset.type.toLowerCase().includes(searchLower) &&
            !tagId.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      // Department filter
      if (department !== "all") {
        const deptName = departmentObj?.name || `Department ${asset.departmentId.slice(-3)}`
        if (deptName !== department) return false
      }
      
      // Building filter  
      if (building !== "all") {
        const buildingName = buildingObj?.name || "Building 1"
        if (buildingName !== building) return false
      }
      
      // Floor filter
      if (floor !== "all") {
        const floorName = floorObj?.name || "Floor 1"
        if (floorName !== floor) return false
      }
      
      // Status filter
      if (status !== "all" && asset.status !== status) return false
      
      // Type filter
      if (type !== "all" && asset.type !== type) return false
      
      return true
    })

    // Calculate pagination
    const total = filteredAssetIds.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    // Only convert the current page to mobile format (performance optimization)
    const pageAssets = filteredAssetIds.slice(startIndex, endIndex)
    
    const mobileAssets = pageAssets.map(asset => {
      const zone = data.zones.find(z => z.id === asset.location.zoneId)
      const floorObj = data.floors.find(f => f.id === zone?.floorId)
      const buildingObj = data.buildings.find(b => b.id === floorObj?.buildingId)
      const departmentObj = data.departments.find(d => d.id === asset.departmentId)
      
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
        department: departmentObj?.name || `Department ${asset.departmentId.slice(-3)}`,
        departmentId: asset.departmentId,
        location: {
          building: buildingObj?.name || "Building 1",
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

    // Generate filter options from ALL assets (but only compute once)
    const departments = [...new Set(data.assets.map(a => {
      const dept = data.departments.find(d => d.id === a.departmentId)
      return dept?.name || `Department ${a.departmentId.slice(-3)}`
    }))].sort()
    
    const buildings = [...new Set(data.buildings.map(b => b.name))].sort()
    const floors = [...new Set(data.floors.map(f => f.name))].sort()
    const types = [...new Set(data.assets.map(a => a.type))].sort()
    const statuses = ["available", "in-use", "maintenance", "lost"]

    return NextResponse.json({
      assets: mobileAssets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
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
