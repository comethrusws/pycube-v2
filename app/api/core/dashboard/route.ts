import { NextResponse } from "next/server"
import { loadData } from "../../../../lib/data"

export async function GET() {
  const data = loadData()
  const totalAssets = data.assets.length
  const totalFacilities = data.facilities.length
  const totalUsers = data.users.length
  const categories = new Set(data.assets.map((a) => a.type)).size || 0
  const tagged = Math.floor(totalAssets * 0.3)
  const untagged = Math.max(totalAssets - tagged, 0)
  const inUse = data.assets.filter((a) => a.status === "in-use").length
  const maintenance = data.assets.filter((a) => a.status === "maintenance").length
  const lost = data.assets.filter((a) => a.status === "lost").length

  return NextResponse.json({
    stats: {
      totalAssets,
      totalFacilities,
      totalUsers,
      categories,
    },
    tagging: { tagged, untagged, percentTagged: Math.round((tagged / totalAssets) * 100) },
    overview: { notFound: lost, inUse, found: Math.max(totalAssets - (lost + inUse), 0) },
    visibility: {
      scanned: Math.floor(totalAssets * 0.1),
      notScanned: Math.ceil(totalAssets * 0.9),
    },
    zonesNotScanned: data.zones.slice(0, 3).map((z) => z.name),
    maintenance,
  })
}

