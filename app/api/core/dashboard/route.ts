import { NextResponse } from "next/server"
import { loadData } from "../../../../lib/data"

export async function GET() {
  const data = loadData()
  const totalAssets = data.assets.length
  const totalFacilities = data.facilities.length
  const totalUsers = data.users.length
  const tagged = Math.floor(totalAssets * 0.3)
  const untagged = totalAssets - tagged
  const inUse = data.assets.filter((a) => a.status === "in-use").length
  const maintenance = data.assets.filter((a) => a.status === "maintenance").length

  return NextResponse.json({
    stats: {
      totalAssets,
      totalFacilities,
      totalUsers,
      categories: 4,
    },
    tagging: { tagged, untagged, percentTagged: Math.round((tagged / totalAssets) * 100) },
    overview: { notFound: 0, inUse, found: totalAssets - inUse },
    visibility: {
      scanned: Math.floor(totalAssets * 0.1),
      notScanned: Math.ceil(totalAssets * 0.9),
    },
    zonesNotScanned: data.zones.slice(0, 3).map((z) => z.name),
    maintenance,
  })
}

