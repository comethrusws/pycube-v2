"use client"

import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useEffect, useState } from "react"
import { apiGet, apiPost } from "@/lib/fetcher"

interface PaginationData {
	page: number
	limit: number
	total: number
	totalPages: number
	hasNext: boolean
	hasPrev: boolean
}

export default function FloorsPage() {
	const [data, setData] = useState<any[]>([])
	const [buildings, setBuildings] = useState<any[]>([])
	const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 25, total: 0, totalPages: 1, hasNext: false, hasPrev: false })
	const [loading, setLoading] = useState(true)
	const [showFilters, setShowFilters] = useState(false)
	const [showAdd, setShowAdd] = useState(false)
	const [filters, setFilters] = useState({ name: "", buildingId: "" })
	const [newFloor, setNewFloor] = useState({ name: "", buildingId: "" })

	const fetchData = async (page = 1) => {
		setLoading(true)
		try {
			const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) })
			if (filters.name) params.set("name", filters.name)
			if (filters.buildingId) params.set("buildingId", filters.buildingId)
			const res = await apiGet<any>(`/api/floors/list?${params.toString()}`)
			setData(res.floors || [])
			setPagination(res.pagination)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		async function init() {
			const b = await apiGet<any>("/api/buildings/list")
			setBuildings(b.buildings || [])
			fetchData(1)
		}
		init()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleAdd = async () => {
		if (!newFloor.name || !newFloor.buildingId) return
		await apiPost("/api/floors", newFloor)
		setShowAdd(false)
		setNewFloor({ name: "", buildingId: "" })
		fetchData(1)
	}

	return (
		<DashboardLayout>
			<div className="p-8 bg-gray-50 min-h-screen">
				<div className="max-w-7xl mx-auto space-y-6">
					<div>
						<h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>Floors</h1>
						<p className="text-gray-600">Manage floors grouped by building</p>
					</div>

					<div className="flex flex-wrap gap-3 items-center justify-between">
						<div className="flex gap-3">
							<button onClick={() => { setFilters({ name: "", buildingId: "" }); setTimeout(() => fetchData(1), 50) }} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Clear Filters</button>
							<button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">{showFilters ? "Hide Filters" : "Show Filters"}</button>
						</div>
						<button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">Add Floor</button>
					</div>

					{showFilters && (
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
									<input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Search by name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
									<select value={filters.buildingId} onChange={(e) => setFilters({ ...filters, buildingId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
										<option value="">All Buildings</option>
										{buildings.map((b: any) => (
											<option key={b.id} value={b.id}>{b.name}</option>
										))}
									</select>
								</div>
							</div>
							<div className="flex gap-3 mt-4">
								<button onClick={() => fetchData(1)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">Apply Filters</button>
								<button onClick={() => { setFilters({ name: "", buildingId: "" }); setTimeout(() => fetchData(1), 50) }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Clear All</button>
							</div>
						</div>
					)}

					<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-200 bg-gray-50">
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Floor</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Building</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Zones</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
									) : data.length === 0 ? (
										<tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No floors found</td></tr>
									) : data.map((f: any) => (
										<tr key={f.id} className="border-b border-gray-200 hover:bg-gray-50">
											<td className="px-4 py-3">
												<div className="text-sm text-gray-900">{f.name}</div>
												<div className="text-xs text-gray-500">ID: {f.id}</div>
											</td>
											<td className="px-4 py-3 text-sm text-gray-900">{f.buildingName}</td>
											<td className="px-4 py-3 text-sm text-gray-900">{f.totalZones}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
							<span className="text-sm text-gray-600">Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries</span>
							<div className="flex items-center gap-2">
								<button onClick={() => fetchData(1)} disabled={!pagination.hasPrev || loading} className="p-1 hover:bg-gray-200 rounded disabled:opacity-50">«</button>
								<button onClick={() => fetchData(pagination.page - 1)} disabled={!pagination.hasPrev || loading} className="p-1 hover:bg-gray-200 rounded disabled:opacity-50">‹</button>
								<button onClick={() => fetchData(pagination.page + 1)} disabled={!pagination.hasNext || loading} className="p-1 hover:bg-gray-200 rounded disabled:opacity-50">›</button>
								<button onClick={() => fetchData(pagination.totalPages)} disabled={!pagination.hasNext || loading} className="p-1 hover:bg-gray-200 rounded disabled:opacity-50">»</button>
								<select value={pagination.limit} onChange={(e) => { setPagination((p) => ({ ...p, limit: parseInt(e.target.value) })); fetchData(1) }} className="ml-4 px-2 py-1 border border-gray-300 rounded text-sm">
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
									<option value={100}>100</option>
								</select>
							</div>
						</div>
					</div>

					{showAdd && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
							<div className="bg-white rounded-lg p-6 w-full max-w-md">
								<h3 className="text-lg font-medium mb-4" style={{ color: "#001f3f" }}>Add Floor</h3>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
										<input value={newFloor.name} onChange={(e) => setNewFloor({ ...newFloor, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
										<select value={newFloor.buildingId} onChange={(e) => setNewFloor({ ...newFloor, buildingId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
											<option value="">Select building</option>
											{buildings.map((b: any) => (
												<option key={b.id} value={b.id}>{b.name}</option>
											))}
										</select>
									</div>
								</div>
								<div className="flex justify-end gap-2 mt-6">
									<button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Cancel</button>
									<button onClick={handleAdd} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">Create</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	)
}
