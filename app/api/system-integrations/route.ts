import { NextResponse } from "next/server"

export async function GET() {
  const integrations = [
    {
      id: "epic",
      name: "Epic",
      type: "EMR",
      logo: "/logos/epic.svg",
      status: "Not Connected",
    },
    {
      id: "cerner",
      name: "Cerner",
      type: "EMR",
      logo: "/logos/cerner.svg",
      status: "Connected",
      lastSync: "2024-07-30T10:00:00Z",
    },
    {
      id: "tma",
      name: "TMA Systems",
      type: "CMMS",
      logo: "/logos/tma.svg",
      status: "Not Connected",
    },
    {
      id: "dude",
      name: "Dude Solutions",
      type: "CMMS",
      logo: "/logos/dude.svg",
      status: "Not Connected",
    },
  ]

  return NextResponse.json(integrations)
}
