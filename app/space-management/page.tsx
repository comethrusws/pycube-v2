"use client"

import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/fetcher"

export default function SpaceManagementOverviewPage() {
	const [stats, setStats] = useState({
		facilities: 0,
		buildings: 0,
		floors: 0,
		zones: 0,
		readers: 0,
		assets: 0,
	})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function load() {
			try {
				const [facilitiesRes, buildingsRes, floorsRes, zonesRes, readersRes, assetsRes] = await Promise.all([
					apiGet<any>("/api/facilities/list"),
					apiGet<any>("/api/buildings/list"),
					apiGet<any>("/api/floors/list"),
					apiGet<any>("/api/zones/list"),
					apiGet<any>("/api/readers/list"),
					apiGet<any>("/api/assets"),
				])
				setStats({
					facilities: facilitiesRes?.pagination?.total || facilitiesRes?.facilities?.length || 0,
					buildings: buildingsRes?.pagination?.total || buildingsRes?.buildings?.length || 0,
					floors: floorsRes?.pagination?.total || floorsRes?.floors?.length || 0,
					zones: zonesRes?.pagination?.total || zonesRes?.zones?.length || 0,
					readers: readersRes?.pagination?.total || readersRes?.readers?.length || 0,
					assets: assetsRes?.assets?.length || 0,
				})
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	return (
		<DashboardLayout>
			<div className="p-8 bg-gray-50 min-h-screen">
				<div className="max-w-7xl mx-auto space-y-6">
					<div>
						<h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>Space Management</h1>
						<p className="text-gray-600">Set up buildings, floors, zones, and readers to enable Live Asset Locator</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
						{[
							{ label: "Facilities", value: stats.facilities },
							{ label: "Buildings", value: stats.buildings },
							{ label: "Floors", value: stats.floors },
							{ label: "Zones", value: stats.zones },
							{ label: "Readers", value: stats.readers },
							{ label: "Assets", value: stats.assets },
						].map((card) => (
							<div key={card.label} className="bg-white rounded-lg p-4 border border-gray-200">
								<p className="text-sm text-gray-600">{card.label}</p>
								<p className="text-2xl font-light" style={{ color: "#001f3f" }}>{loading ? "-" : card.value}</p>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-lg font-medium mb-3" style={{ color: "#001f3f" }}>Get Started</h2>
							<ol className="list-decimal list-inside text-gray-700 space-y-2">
								<li>Create Buildings for each facility</li>
								<li>Add Floors under each Building</li>
								<li>Define Zones (rooms/corridors) on each Floor</li>
								<li>Add Readers per Zone to enable tracking</li>
							</ol>
						</div>
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-lg font-medium mb-3" style={{ color: "#001f3f" }}>Live Asset Locator</h2>
							<p className="text-gray-700">With readers in place, the system can show the latest known location per asset at the Zone level, enabling quick retrieval.</p>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	)
}
