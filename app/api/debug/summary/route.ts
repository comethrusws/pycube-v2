import { NextResponse } from "next/server"
import { loadData } from "../../../../lib/data"

export async function GET() {
  const d = loadData()
  return NextResponse.json({
    counts: {
      facilities: d.facilities.length,
      departments: d.departments.length,
      buildings: d.buildings.length,
      floors: d.floors.length,
      zones: d.zones.length,
      readers: d.readers.length,
      users: d.users.length,
      assets: d.assets.length,
      movementLogs: d.movementLogs.length,
      maintenanceTasks: d.maintenanceTasks.length,
      alerts: d.alerts.length,
      userLogs: d.userLogs.length,
      pointsOfContact: d.pointsOfContact.length,
      userUtilizations: d.userUtilizations.length,
    },
  })
}

