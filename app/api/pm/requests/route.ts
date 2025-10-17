import { NextResponse } from "next/server"
import { getStore } from "@/data/store"

export async function GET(request: Request) {
  const store = getStore()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "25"), 200)
  const status = (searchParams.get("status") || "").toLowerCase()
  const department = (searchParams.get("department") || "").toLowerCase()

  const items = store.maintenanceTasks
    .map((t) => {
      const asset = store.assets.find((a) => a.id === t.assetId)!
      const dep = store.departments.find((d) => d.id === asset.departmentId)!
      return {
        id: t.id.toUpperCase(),
        status: t.status,
        requestor: store.users.find((u) => u.id === t.assignedTo)?.name || "System",
        category: "Preventive",
        priority: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        urgency: ["Normal", "Urgent"][Math.floor(Math.random() * 2)],
        department: dep.name,
        description: `Maintenance for ${asset.name}`,
        maintenanceDate: t.scheduledDate.slice(0, 10),
        businessCriticality: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
        lastModified: new Date().toISOString().slice(0, 10),
      }
    })
    .filter((r) => (status ? r.status.toLowerCase() === status : true))
    .filter((r) => (department ? r.department.toLowerCase().includes(department) : true))

  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)
  return NextResponse.json({ total: items.length, page, pageSize, items: paged })
}


