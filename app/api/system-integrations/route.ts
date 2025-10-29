import { NextResponse } from "next/server"

export async function GET() {
  const integrations = [
    {
      id: "epic",
      name: "Epic",
      type: "EMR",
      logo: "/logos/epic.png",
      status: "Not Connected",
    },
    {
      id: "cerner",
      name: "Cerner",
      type: "EMR",
      logo: "/logos/cerner.png",
      status: "Connected",
      lastSync: "2024-07-30T10:00:00Z",
    },
    {
      id: "tma",
      name: "TMA Systems",
      type: "CMMS",
      logo: "/logos/tma.png",
      status: "Not Connected",
    },
    {
      id: "brightly",
      name: "Brightly",
      type: "CMMS",
      logo: "/logos/brightly.png",
      status: "Not Connected",
    },
  ]

  return NextResponse.json(integrations)
}
