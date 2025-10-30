import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
	try {
		const data = await loadSeedData()
		const { searchParams } = new URL(request.url)

		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "25")
		const name = searchParams.get("name") || ""
		const buildingId = searchParams.get("buildingId") || ""

		let filtered = data.floors || []

		if (name) {
			filtered = filtered.filter((f) => f.name.toLowerCase().includes(name.toLowerCase()))
		}
		if (buildingId) {
			filtered = filtered.filter((f) => f.buildingId === buildingId)
		}

		const total = filtered.length
		const totalPages = Math.ceil(total / limit)
		const offset = (page - 1) * limit
		const paginatedData = filtered.slice(offset, offset + limit)

		const enriched = paginatedData.map((f) => {
			const building = data.buildings.find((b) => b.id === f.buildingId)
			const zones = data.zones.filter((z) => z.floorId === f.id)
			return {
				...f,
				buildingName: building?.name || "Unknown Building",
				totalZones: zones.length,
			}
		})

		return NextResponse.json({
			floors: enriched,
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
		console.error("Floors list API error:", error)
		return NextResponse.json({ error: "Failed to load floors" }, { status: 500 })
	}
}
