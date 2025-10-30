import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
	try {
		const data = await loadSeedData()
		const { searchParams } = new URL(request.url)

		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "25")
		const name = searchParams.get("name") || ""
		const facilityId = searchParams.get("facilityId") || ""

		let filtered = data.buildings || []

		if (name) {
			filtered = filtered.filter((b) => b.name.toLowerCase().includes(name.toLowerCase()))
		}
		if (facilityId) {
			filtered = filtered.filter((b) => b.facilityId === facilityId)
		}

		const total = filtered.length
		const totalPages = Math.ceil(total / limit)
		const offset = (page - 1) * limit
		const paginatedData = filtered.slice(offset, offset + limit)

		const enriched = paginatedData.map((b) => {
			const facility = data.facilities.find((f) => f.id === b.facilityId)
			const floors = data.floors.filter((f) => f.buildingId === b.id)
			return {
				...b,
				facilityName: facility?.name || "Unknown Facility",
				totalFloors: floors.length,
			}
		})

		return NextResponse.json({
			buildings: enriched,
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
		console.error("Buildings list API error:", error)
		return NextResponse.json({ error: "Failed to load buildings" }, { status: 500 })
	}
}
