import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

// Helper function to convert a raw asset to the mobile-friendly format
const toMobileAsset = (asset: any, data: any) => {
  const zone = data.zones.find((z: any) => z.id === asset.location.zoneId)
  const floorObj = data.floors.find((f: any) => f.id === zone?.floorId)
  const buildingObj = data.buildings.find((b: any) => b.id === floorObj?.buildingId)
  const departmentObj = data.departments.find((d: any) => d.id === asset.departmentId)

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
        y: 50 + (row * 80) + (assetIndex % 30),
      },
    },
    maintenanceReadiness: asset.utilization > 70 ? "green" : asset.utilization > 40 ? "yellow" : "red",
    lastSeen: asset.lastActive,
    serialNumber: asset.serialNumber || `SN${asset.id.slice(-8)}`,
    value: asset.value || Math.floor(Math.random() * 50000) + 5000,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { assetId, action, userId, notes } = await request.json()
    const data = await loadSeedData()

    const asset = data.assets.find((a: any) => a.id === assetId)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    const user = data.users.find((u: any) => u.id === userId) || { name: "Mobile User" }
    const timestamp = new Date().toISOString()

    let result: any = { success: true, message: "" }

    switch (action) {
      case "retrieve":
        asset.status = "in-use"
        asset.lastActive = timestamp
        result.message = notes || `${asset.name} has been checked out and is now in use.`
        break

      case "return":
        asset.status = "available"
        asset.lastActive = timestamp
        result.message = notes || `${asset.name} has been returned and is now available.`
        break

      case "report_missing":
        asset.status = "lost"
        asset.lastActive = timestamp
        result.message = notes || `${asset.name} has been reported as missing. Security and Biomedical teams have been notified.`
        break

      case "schedule_maintenance":
        // Update maintenance due date to next month
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        asset.maintenanceDue = nextMonth.toISOString()
        result.message = notes || `Preventive maintenance has been scheduled for ${asset.name}.`
        break

      case "urgent_maintenance":
        asset.status = "maintenance"
        asset.lastActive = timestamp
        result.message = notes || `Urgent maintenance request submitted for ${asset.name}. Asset marked for immediate attention.`
        break

      case "maintenance_request":
        result.message = notes || `Maintenance request submitted for ${asset.name}.`
        break

      case "request_relocation":
        result.message = notes || `Relocation request submitted for ${asset.name}. Facilities team will coordinate the move.`
        break

      case "locate":
        const zone = data.zones.find((z: any) => z.id === asset.location.zoneId)
        const floor = data.floors.find((f: any) => f.id === zone?.floorId)
        const building = data.buildings.find((b: any) => b.id === floor?.buildingId)
        result.message = notes || `${asset.name} is located in ${zone?.name}, ${floor?.name}, ${building?.name}. Last seen: ${new Date(asset.lastActive).toLocaleString()}`
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    result.updatedAsset = toMobileAsset(asset, data)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Mobile asset action API error:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}
