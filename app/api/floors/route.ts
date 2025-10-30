import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, buildingId } = body || {}
		if (!name || !buildingId) {
			return NextResponse.json({ error: "name and buildingId are required" }, { status: 400 })
		}

		const data = await loadSeedData()
		const newFloor = {
			id: `FLR-${Date.now()}`,
			name,
			buildingId,
			zones: [],
		}
		data.floors.push(newFloor)

		return NextResponse.json({ floor: newFloor }, { status: 201 })
	} catch (error) {
		console.error("Create floor error:", error)
		return NextResponse.json({ error: "Failed to create floor" }, { status: 500 })
	}
}
