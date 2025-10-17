import { NextResponse } from "next/server"
import { getStore } from "@/data/store"

function toDateString(d: Date): string {
  const mm = (d.getMonth() + 1).toString().padStart(2, "0")
  const dd = d.getDate().toString().padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${yyyy}-${mm}-${dd}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "10"), 100)
  const listId = (searchParams.get("listId") || "").toLowerCase()
  const listName = (searchParams.get("listName") || "").toLowerCase()

  const store = getStore()

  // Synthesize "location lists" from assets grouped by zone
  const zoneToAssets: Record<string, number> = {}
  for (const a of store.assets) {
    zoneToAssets[a.location.zoneId] = (zoneToAssets[a.location.zoneId] || 0) + 1
  }

  const results = Object.entries(zoneToAssets).map(([zoneId, count], idx) => {
    const zone = store.zones.find((z) => z.id === zoneId)!
    const floor = store.floors.find((f) => f.id === zone.floorId)!
    const building = store.buildings.find((b) => b.id === floor.buildingId)!
    const created = new Date(Date.now() - (idx % 14) * 86400000)
    const target = new Date(Date.now() + ((idx % 10) + 1) * 86400000)
    return {
      id: `loc-${idx}`,
      listId: `LOC-${(1000 + idx).toString(36).toUpperCase()}`,
      listName: `${building.name} / ${floor.name} / ${zone.name}`,
      createdDate: toDateString(created),
      targetCompletionDate: toDateString(target),
      completedDate: idx % 5 === 0 ? toDateString(new Date()) : "",
      createdBy: store.users[idx % store.users.length]?.name || "System",
      assignedGroup: store.userGroups[idx % store.userGroups.length]?.name || "Operations",
      assetCount: count,
      updatedBy: store.users[(idx + 1) % store.users.length]?.name || "System",
    }
  })
    .filter((r) => (listId ? r.listId.toLowerCase().includes(listId) : true))
    .filter((r) => (listName ? r.listName.toLowerCase().includes(listName) : true))

  const start = (page - 1) * pageSize
  const paged = results.slice(start, start + pageSize)
  return NextResponse.json({ total: results.length, page, pageSize, items: paged })
}


