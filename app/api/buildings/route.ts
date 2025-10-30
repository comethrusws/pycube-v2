import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, facilityId } = body || {}
		if (!name || !facilityId) {
			return NextResponse.json({ error: "name and facilityId are required" }, { status: 400 })
		}

		const data = await loadSeedData()
		const newBuilding = {
			id: `BLD-${Date.now()}`,
			name,
			facilityId,
			floors: [],
		}
		data.buildings.push(newBuilding)

		return NextResponse.json({ building: newBuilding }, { status: 201 })
	} catch (error) {
		console.error("Create building error:", error)
		return NextResponse.json({ error: "Failed to create building" }, { status: 500 })
	}
}
