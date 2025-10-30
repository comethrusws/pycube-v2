import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
	try {
		const data = await loadSeedData()
		const { searchParams } = new URL(request.url)

		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "25")
		const name = searchParams.get("name") || ""
		const floorId = searchParams.get("floorId") || ""

		let filtered = data.zones || []

		if (name) {
			filtered = filtered.filter((z) => z.name.toLowerCase().includes(name.toLowerCase()))
		}
		if (floorId) {
			filtered = filtered.filter((z) => z.floorId === floorId)
		}

		const total = filtered.length
		const totalPages = Math.ceil(total / limit)
		const offset = (page - 1) * limit
		const paginatedData = filtered.slice(offset, offset + limit)

		const enriched = paginatedData.map((z) => {
			const floor = data.floors.find((f) => f.id === z.floorId)
			const building = data.buildings.find((b) => b.id === floor?.buildingId)
			const readers = data.readers.filter((r) => r.zoneId === z.id)
			const assets = data.assets.filter((a) => a.location.zoneId === z.id)
			return {
				...z,
				floorName: floor?.name || "Unknown Floor",
				buildingName: building?.name || "Unknown Building",
				totalReaders: readers.length,
				totalAssets: assets.length,
			}
		})

		return NextResponse.json({
			zones: enriched,
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
		console.error("Zones list API error:", error)
		return NextResponse.json({ error: "Failed to load zones" }, { status: 500 })
	}
}
