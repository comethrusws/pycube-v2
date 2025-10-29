import { NextResponse } from "next/server"

export async function GET() {
  const logs = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      level: "Info",
      message: "Sync started for Cerner integration.",
      integration: "Cerner",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      level: "Info",
      message: "Successfully synced 1,200 new records.",
      integration: "Cerner",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      level: "Warning",
      message: "Could not sync 5 records due to missing patient ID.",
      integration: "Cerner",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      level: "Info",
      message: "Sync completed.",
      integration: "Cerner",
    },
     {
      id: "5",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      level: "Error",
      message: "Failed to connect to TMA Systems API.",
      integration: "TMA Systems",
    },
  ]

  return NextResponse.json(logs)
}
