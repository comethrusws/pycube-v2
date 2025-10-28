import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function POST(request: NextRequest) {
  try {
    const { assetId, action, userId, notes } = await request.json()
    const data = await loadSeedData()
    
    const asset = data.assets.find(a => a.id === assetId)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    const user = data.users.find(u => u.id === userId) || { name: "Mobile User" }
    const timestamp = new Date().toISOString()

    let result: any = { success: true, message: "", updatedAsset: asset }

    switch (action) {
      case "retrieve":
        // Mark asset as in use
        asset.status = "in-use"
        asset.lastActive = timestamp
        
        // Create movement log
        const retrievalLog = {
          id: `log-${Date.now()}`,
          assetId,
          fromZoneId: asset.location.zoneId,
          toZoneId: asset.location.zoneId, // Same zone but status change
          timestamp,
          authorized: true,
          movedBy: userId,
          reason: "asset_retrieval"
        }
        
        // Create user log
        const userLog = {
          id: `ulog-${Date.now()}`,
          userId,
          action: "retrieve_asset",
          details: `Retrieved ${asset.name} via mobile app`,
          timestamp,
          ipAddress: "mobile",
          userAgent: "Mobile App"
        }

        result.message = `${asset.name} has been marked as retrieved and is now in use.`
        result.logs = [retrievalLog, userLog]
        break

      case "report_missing":
        // Mark asset as lost
        asset.status = "lost"
        asset.lastActive = timestamp
        
        // Create alert for biomedical team
        const alert = {
          id: `alert-${Date.now()}`,
          type: "movement",
          assetId,
          targetRole: "biomedical",
          message: `Asset ${asset.name} reported missing by ${user.name}${notes ? `. Notes: ${notes}` : ''}`,
          severity: "high",
          createdAt: timestamp,
          resolved: false
        }

        // Create user log
        const missingLog = {
          id: `ulog-${Date.now()}`,
          userId,
          action: "report_missing",
          details: `Reported ${asset.name} as missing${notes ? `. Notes: ${notes}` : ''}`,
          timestamp,
          ipAddress: "mobile",
          userAgent: "Mobile App"
        }

        result.message = `${asset.name} has been reported as missing. Biomedical team has been notified.`
        result.alert = alert
        result.logs = [missingLog]
        break

      case "maintenance_request":
        // Create maintenance request
        const maintenanceRequest = {
          id: `MR-${Date.now().toString().slice(-6)}`,
          status: "Pending",
          requestor: user.name,
          category: "Corrective",
          priority: "Medium",
          urgency: "Normal",
          department: asset.departmentId,
          description: `Maintenance requested via mobile app for ${asset.name}${notes ? `. Issue: ${notes}` : ''}`,
          maintenanceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          businessCriticality: "Medium",
          lastModified: timestamp.split('T')[0],
          assetName: asset.name,
          assetId,
          estimatedCost: 250,
          createdBy: user.name
        }

        // Create user log
        const maintenanceLog = {
          id: `ulog-${Date.now()}`,
          userId,
          action: "request_maintenance",
          details: `Requested maintenance for ${asset.name}${notes ? `. Issue: ${notes}` : ''}`,
          timestamp,
          ipAddress: "mobile",
          userAgent: "Mobile App"
        }

        result.message = `Maintenance request submitted for ${asset.name}.`
        result.maintenanceRequest = maintenanceRequest
        result.logs = [maintenanceLog]
        break

      case "locate":
        // Just return current location - no status change needed
        const zone = data.zones.find(z => z.id === asset.location.zoneId)
        const floor = data.floors.find(f => f.id === zone?.floorId)
        const building = data.buildings.find(b => b.id === floor?.buildingId)
        
        result.message = `${asset.name} is located in ${zone?.name}, ${floor?.name}, ${building?.name}`
        result.location = {
          building: building?.name,
          floor: floor?.name,
          zone: zone?.name,
          coordinates: {
            x: 100 + (parseInt(assetId.slice(-3)) % 300),
            y: 100 + (parseInt(assetId.slice(-2)) % 200)
          }
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Mobile asset action API error:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}
