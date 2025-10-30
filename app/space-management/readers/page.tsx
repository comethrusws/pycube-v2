"use client"

import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiGet, apiPost } from "@/lib/fetcher"

interface PaginationData {
	page: number
	limit: number
	total: number
	totalPages: number
	hasNext: boolean
	hasPrev: boolean
}

export default function ReadersPage() {
	const [data, setData] = useState<any[]>([])
	const router = useRouter()
	const [zones, setZones] = useState<any[]>([])
	const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 25, total: 0, totalPages: 1, hasNext: false, hasPrev: false })
	const [loading, setLoading] = useState(true)
	const [showFilters, setShowFilters] = useState(false)
	const [showAdd, setShowAdd] = useState(false)
	const [filters, setFilters] = useState({ name: "", zoneId: "", status: "" })
	const [newReader, setNewReader] = useState({ name: "", zoneId: "", status: "online" })

	const fetchData = async (page = 1) => {
		setLoading(true)
		try {
			const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) })
			if (filters.name) params.set("name", filters.name)
			if (filters.zoneId) params.set("zoneId", filters.zoneId)
			if (filters.status) params.set("status", filters.status)
			const res = await apiGet<any>(`/api/readers/list?${params.toString()}`)
			setData(res.readers || [])
			setPagination(res.pagination)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		async function init() {
			const z = await apiGet<any>("/api/zones/list")
			setZones(z.zones || [])
			fetchData(1)
		}
		init()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleAdd = async () => {
		if (!newReader.name || !newReader.zoneId) return
		await apiPost("/api/readers", newReader)
		setShowAdd(false)
		setNewReader({ name: "", zoneId: "", status: "online" })
		fetchData(1)
	}

	return (
		<DashboardLayout>
			<div className="p-8 bg-gray-50 min-h-screen">
				<div className="max-w-7xl mx-auto space-y-6">
					<div>
						<h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>Readers</h1>
						<p className="text-gray-600">RFID readers per zone for live asset tracking</p>
					</div>

					<div className="flex flex-wrap gap-3 items-center justify-between">
						<div className="flex gap-3">
							<button onClick={() => { setFilters({ name: "", zoneId: "", status: "" }); setTimeout(() => fetchData(1), 50) }} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Clear Filters</button>
							<button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">{showFilters ? "Hide Filters" : "Show Filters"}</button>
						</div>
						<button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">Add Reader</button>
					</div>

					{showFilters && (
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
									<input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Search by name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
									<select value={filters.zoneId} onChange={(e) => setFilters({ ...filters, zoneId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
										<option value="">All Zones</option>
										{zones.map((z: any) => (
											<option key={z.id} value={z.id}>{z.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
									<select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
										<option value="">All</option>
										<option value="online">Online</option>
										<option value="offline">Offline</option>
									</select>
								</div>
							</div>
							<div className="flex gap-3 mt-4">
								<button onClick={() => fetchData(1)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">Apply Filters</button>
								<button onClick={() => { setFilters({ name: "", zoneId: "", status: "" }); setTimeout(() => fetchData(1), 50) }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Clear All</button>
							</div>
						</div>
					)}

					<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-200 bg-gray-50">
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reader</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
									) : data.length === 0 ? (
										<tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No readers found</td></tr>
									) : data.map((r: any) => (
									<tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/space-management/readers/${r.id}`)}>
											<td className="px-4 py-3">
											<div className="text-sm text-gray-900">{r.name}</div>
												<div className="text-xs text-gray-500">ID: {r.id}</div>
											</td>
											<td className="px-4 py-3 text-sm text-gray-900">{r.buildingName} • {r.floorName} • {r.zoneName}</td>
											<td className="px-4 py-3 text-sm">
												<span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${r.status === "online" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>{r.status}</span>
											</td>
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
								<h3 className="text-lg font-medium mb-4" style={{ color: "#001f3f" }}>Add Reader</h3>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
										<input value={newReader.name} onChange={(e) => setNewReader({ ...newReader, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
										<select value={newReader.zoneId} onChange={(e) => setNewReader({ ...newReader, zoneId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
											<option value="">Select zone</option>
											{zones.map((z: any) => (
												<option key={z.id} value={z.id}>{z.name}</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
										<select value={newReader.status} onChange={(e) => setNewReader({ ...newReader, status: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
											<option value="online">Online</option>
											<option value="offline">Offline</option>
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
