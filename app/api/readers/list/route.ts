import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
	try {
		const data = await loadSeedData()
		const { searchParams } = new URL(request.url)

		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "25")
		const name = searchParams.get("name") || ""
		const zoneId = searchParams.get("zoneId") || ""
		const status = searchParams.get("status") || ""

		let filtered = data.readers || []

		if (name) {
			filtered = filtered.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()))
		}
		if (zoneId) {
			filtered = filtered.filter((r) => r.zoneId === zoneId)
		}
		if (status) {
			filtered = filtered.filter((r) => r.status === (status as any))
		}

		const total = filtered.length
		const totalPages = Math.ceil(total / limit)
		const offset = (page - 1) * limit
		const paginatedData = filtered.slice(offset, offset + limit)

		const enriched = paginatedData.map((r) => {
			const zone = data.zones.find((z) => z.id === r.zoneId)
			const floor = data.floors.find((f) => f.id === zone?.floorId)
			const building = data.buildings.find((b) => b.id === floor?.buildingId)
			return {
				...r,
				zoneName: zone?.name || "Unknown Zone",
				floorName: floor?.name || "Unknown Floor",
				buildingName: building?.name || "Unknown Building",
			}
		})

		return NextResponse.json({
			readers: enriched,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		})
	} catch (error) {
		console.error("Readers list API error:", error)
		return NextResponse.json({ error: "Failed to load readers" }, { status: 500 })
	}
}
