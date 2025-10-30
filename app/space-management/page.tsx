"use client"

import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useEffect, useMemo, useState } from "react"
import { apiGet } from "@/lib/fetcher"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

interface BuildingOption { id: string; name: string }

export default function SpaceManagementOverviewPage() {
	const [assetsBundle, setAssetsBundle] = useState<any>({ assets: [], buildings: [], floors: [], zones: [] })
	const [readersBundle, setReadersBundle] = useState<any>({ readers: [], pagination: {} })
	const [buildingId, setBuildingId] = useState<string>("")
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function load() {
			setLoading(true)
			try {
				const [assetsRes, readersRes] = await Promise.all([
					apiGet<any>("/api/assets"),
					apiGet<any>("/api/readers/list?limit=10000"),
				])
				setAssetsBundle(assetsRes)
				setReadersBundle(readersRes)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	const buildings: BuildingOption[] = useMemo(() => {
		return (assetsBundle?.buildings ?? []).map((b: any) => ({ id: b.id, name: b.name }))
	}, [assetsBundle])

	const floorsInScope = useMemo(() => {
		const allFloors = assetsBundle?.floors ?? []
		if (!buildingId) return allFloors
		return allFloors.filter((f: any) => f.buildingId === buildingId)
	}, [assetsBundle, buildingId])

	const zonesInScope = useMemo(() => {
		const allZones = assetsBundle?.zones ?? []
		const floorIds = new Set(floorsInScope.map((f: any) => f.id))
		return allZones.filter((z: any) => floorIds.has(z.floorId))
	}, [assetsBundle, floorsInScope])

	const readersInScope = useMemo(() => {
		const allReaders = readersBundle?.readers ?? []
		const zoneIds = new Set(zonesInScope.map((z: any) => z.id))
		return allReaders.filter((r: any) => zoneIds.has(r.zoneId))
	}, [readersBundle, zonesInScope])

	const assetsInScope = useMemo(() => {
		const allAssets = assetsBundle?.assets ?? []
		const zoneIds = new Set(zonesInScope.map((z: any) => z.id))
		return allAssets.filter((a: any) => zoneIds.has(a.location?.zoneId))
	}, [assetsBundle, zonesInScope])

	const stats = useMemo(() => {
		const totalFloors = floorsInScope.length
		const totalZones = zonesInScope.length
		const totalAssets = assetsInScope.length
		const online = readersInScope.filter((r: any) => r.status === "online").length
		const offline = readersInScope.length - online
		const inUse = assetsInScope.filter((a: any) => a.status === "in-use").length
		const available = assetsInScope.filter((a: any) => a.status === "available").length
		const maintenance = assetsInScope.filter((a: any) => a.status === "maintenance").length
		return { totalFloors, totalZones, totalAssets, readersOnline: online, readersOffline: offline, inUse, available, maintenance }
	}, [floorsInScope, zonesInScope, assetsInScope, readersInScope])

	const floorRows = useMemo(() => {
		const byFloor: Record<string, any> = {}
		for (const f of floorsInScope) {
			byFloor[f.id] = { floorId: f.id, floorName: f.name, zones: 0, readersOnline: 0, readersOffline: 0, assetsTotal: 0, assetsInUse: 0, assetsAvailable: 0, assetsMaint: 0 }
		}
		for (const z of zonesInScope) {
			const row = byFloor[z.floorId]
			if (row) row.zones += 1
		}
		for (const r of readersInScope) {
			const zone = zonesInScope.find((z: any) => z.id === r.zoneId)
			if (!zone) continue
			const row = byFloor[zone.floorId]
			if (!row) continue
			if (r.status === "online") row.readersOnline += 1
			else row.readersOffline += 1
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
	}, [floorsInScope, zonesInScope, readersInScope, assetsInScope])

	const barData = useMemo(() => {
		return floorRows.slice(0, 10).map((r: any) => ({
			name: r.floorName,
			Available: r.assetsAvailable,
			"In Use": r.assetsInUse,
			Maintenance: r.assetsMaint,
		}))
	}, [floorRows])

	const readerPieData = useMemo(() => {
		return [
			{ name: "Online", value: stats.readersOnline },
			{ name: "Offline", value: stats.readersOffline },
		]
	}, [stats])

	const colors = ["#0d7a8c", "#c41e3a", "#1e3a8a", "#10b981", "#f59e0b"]

	return (
		<DashboardLayout>
			<div className="p-8 bg-gray-50 min-h-screen">
				<div className="max-w-7xl mx-auto space-y-6">
					<div className="flex items-end justify-between gap-4 flex-wrap">
						<div>
							<h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>Space Management</h1>
							<p className="text-gray-600">Floor-wise asset management and reader coverage</p>
						</div>
						<div className="w-full md:w-72">
							<label className="block text-sm font-medium text-gray-700 mb-1">Filter by Building</label>
							<select
								value={buildingId}
								onChange={(e) => setBuildingId(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
								style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
							>
								<option value="">All Buildings</option>
								{buildings.map((b) => (
									<option key={b.id} value={b.id}>{b.name}</option>
								))}
							</select>
						</div>
					</div>

					{/* Stat Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
						{[
							{ label: "Floors", value: stats.totalFloors },
							{ label: "Zones", value: stats.totalZones },
							{ label: "Readers Online", value: stats.readersOnline },
							{ label: "Readers Offline", value: stats.readersOffline },
							{ label: "Assets In Use", value: stats.inUse },
							{ label: "Assets Available", value: stats.available },
						].map((card) => (
							<div key={card.label} className="bg-white rounded-lg p-4 border border-gray-200">
								<p className="text-sm text-gray-600">{card.label}</p>
								<p className="text-2xl font-light" style={{ color: "#001f3f" }}>{loading ? "-" : (card.value ?? 0).toLocaleString()}</p>
							</div>
						))}
					</div>

					{/* Charts */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="bg-white rounded-xl p-6 border border-gray-200">
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
						<div className="bg-white rounded-xl p-6 border border-gray-200">
							<h3 className="text-sm font-medium uppercase tracking-wide mb-4" style={{ color: "#001f3f" }}>Reader Coverage</h3>
							<div className="bg-slate-50 rounded-lg border border-gray-200 p-2 min-h-64 flex items-center justify-center">
								<ResponsiveContainer width="100%" height={220}>
									<PieChart>
										<Pie data={readerPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
											{readerPieData.map((_, idx) => (
												<Cell key={idx} fill={idx === 0 ? "#10b981" : "#c41e3a"} />
											))}
										</Pie>
										<Tooltip />
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-200">
							<h3 className="text-sm font-medium uppercase tracking-wide mb-4" style={{ color: "#001f3f" }}>Zones & Assets Snapshot</h3>
							<div className="space-y-3">
								<p className="text-sm text-gray-700">Floors: {stats.totalFloors.toLocaleString()} • Zones: {stats.totalZones.toLocaleString()} • Assets: {stats.totalAssets.toLocaleString()}</p>
								<p className="text-sm text-gray-700">Readers Online: {stats.readersOnline} • Offline: {stats.readersOffline}</p>
								<p className="text-xs text-gray-500">Filter a building to narrow the scope. Charts update instantly from seed.</p>
							</div>
						</div>
					</div>

					{/* Floor Table */}
					<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-200 bg-gray-50">
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Floor</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Zones</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Readers (On/Off)</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assets (Avail/In Use/Maint)</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
									) : floorRows.length === 0 ? (
										<tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No floors found</td></tr>
									) : floorRows.map((r: any) => (
										<tr key={r.floorId} className="border-b border-gray-200 hover:bg-gray-50">
											<td className="px-4 py-3">
												<div className="text-sm text-gray-900">{r.floorName}</div>
												<div className="text-xs text-gray-500">ID: {r.floorId}</div>
											</td>
											<td className="px-4 py-3 text-sm text-gray-900">{r.zones}</td>
											<td className="px-4 py-3 text-sm text-gray-900">{r.readersOnline}/{r.readersOffline}</td>
											<td className="px-4 py-3 text-sm text-gray-900">{r.assetsAvailable}/{r.assetsInUse}/{r.assetsMaint}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	)
}
