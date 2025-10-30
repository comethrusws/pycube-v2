import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, floorId } = body || {}
		if (!name || !floorId) {
			return NextResponse.json({ error: "name and floorId are required" }, { status: 400 })
		}

		const data = await loadSeedData()
		const newZone = {
			id: `ZNE-${Date.now()}`,
			name,
			floorId,
			readers: [],
		}
		data.zones.push(newZone)

		return NextResponse.json({ zone: newZone }, { status: 201 })
	} catch (error) {
		console.error("Create zone error:", error)
		return NextResponse.json({ error: "Failed to create zone" }, { status: 500 })
	}
}
