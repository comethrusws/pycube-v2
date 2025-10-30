import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"
import type { Reader } from "@/lib/types"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, zoneId, status } = body || {}
		if (!name || !zoneId) {
			return NextResponse.json({ error: "name and zoneId are required" }, { status: 400 })
		}

		const data = await loadSeedData()
		const newReader: Reader = {
			id: `RDR-${Date.now()}`,
			name,
			zoneId,
			status: status === "offline" ? "offline" : "online",
		}
		data.readers.push(newReader)

		return NextResponse.json({ reader: newReader }, { status: 201 })
	} catch (error) {
		console.error("Create reader error:", error)
		return NextResponse.json({ error: "Failed to create reader" }, { status: 500 })
	}
}
