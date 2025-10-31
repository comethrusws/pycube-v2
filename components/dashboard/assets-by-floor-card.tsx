"use client"

import { useEffect, useMemo, useState } from "react"
import { apiGet } from "@/lib/fetcher"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

import { useRouter } from "next/navigation"

export default function AssetsByFloorCard() {
	const [assetsBundle, setAssetsBundle] = useState<any>({ assets: [], buildings: [], floors: [], zones: [] })
  const router = useRouter()

	useEffect(() => {
		async function load() {
			try {
				const assetsRes = await apiGet<any>("/api/assets")
				setAssetsBundle(assetsRes)
			} catch (e) {
				console.error(e)
			}
		}
		load()
	}, [])

	const floorsInScope = useMemo(() => {
		return assetsBundle?.floors ?? []
	}, [assetsBundle])

	const zonesInScope = useMemo(() => {
		return assetsBundle?.zones ?? []
	}, [assetsBundle])

	const assetsInScope = useMemo(() => {
		return assetsBundle?.assets ?? []
	}, [assetsBundle])

	const floorRows = useMemo(() => {
		const byFloor: Record<string, any> = {}
		for (const f of floorsInScope) {
			byFloor[f.id] = { floorId: f.id, floorName: f.name, assetsTotal: 0, assetsInUse: 0, assetsAvailable: 0, assetsMaint: 0 }
		}
		for (const a of assetsInScope) {
			const rowZone = zonesInScope.find((z: any) => z.id === a.location?.zoneId)
			if (!rowZone) continue
			const row = byFloor[rowZone.floorId]
			if (!row) continue
			row.assetsTotal += 1
			if (a.status === "in-use") row.assetsInUse += 1
			else if (a.status === "available") row.assetsAvailable += 1
			else if (a.status === "maintenance") row.assetsMaint += 1
		}
		return Object.values(byFloor).sort((a: any, b: any) => b.assetsTotal - a.assetsTotal)
	}, [floorsInScope, zonesInScope, assetsInScope])

	const barData = useMemo(() => {
		return floorRows.slice(0, 10).map((r: any) => ({
			name: r.floorName,
			Available: r.assetsAvailable,
			"In Use": r.assetsInUse,
			Maintenance: r.assetsMaint,
		}))
	}, [floorRows])

	return (
		<div onClick={() => router.push("/space-management")} className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1">
			<h3 className="text-sm font-medium uppercase tracking-wide mb-4" style={{ color: "#001f3f" }}>Assets by Floor (Top 10)</h3>
			<div className="bg-slate-50 rounded-lg border border-gray-200 p-2 min-h-64">
				<ResponsiveContainer width="100%" height={260}>
					<BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
						<XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} interval="preserveStartEnd" />
						<YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
						<Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
						<Legend />
						<Bar dataKey="Available" stackId="a" fill="#10b981" />
						<Bar dataKey="In Use" stackId="a" fill="#0d7a8c" />
						<Bar dataKey="Maintenance" stackId="a" fill="#f59e0b" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
