"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { apiGet } from "@/lib/fetcher"

export default function DashboardContent() {
  const [data, setData] = useState<{
    stats: { totalAssets: number; totalFacilities: number; totalUsers: number; categories: number }
    tagging: { tagged: number; untagged: number; percentTagged: number }
    overview: { notFound: number; inUse: number; found: number }
    visibility: { scanned: number; notScanned: number; trend: { date: string; scanned: number; notScanned: number }[] }
    zonesNotScanned: string[]
    assetDetails: { recentAssets: { id: string; name: string; type: string; location: string; status: string }[]; topCategories: { name: string; count: number }[]; maintenanceDue: { id: string; name: string; dueDate: string }[] }
  }>()

  const [range, setRange] = useState<"day" | "week" | "month">("week")
  useEffect(() => {
    apiGet<typeof data>(`/api/core/dashboard?range=${range}`).then((d) => setData(d as any)).catch(() => {})
  }, [range])
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>
          Overview
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Assets", subtitle: "In System", value: data?.stats.totalAssets ?? "-" },
          { title: "Total Assets", subtitle: "Category", value: data?.stats.categories ?? "-" },
          { title: "Total Facilities", subtitle: "Facility", value: data?.stats.totalFacilities ?? "-" },
          { title: "Total Users", subtitle: "Active", value: data?.stats.totalUsers ?? "-" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
              {card.title}
            </p>
            <p className="text-xs text-gray-600 mb-4">{card.subtitle}</p>
            <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Tagged */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0d7a8c" }}>
                Asset Tagged
              </p>
              <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                {data?.tagging.tagged ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#c41e3a" }}>
                Untagged
              </p>
              <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                {data?.tagging.untagged ?? 0}
              </p>
            </div>

            <div className="flex justify-center py-6">
              <div className="relative w-96 h-56">
                {(() => {
                  const pct = Number(data?.tagging.percentTagged ?? 0)
                  return (
                    <svg viewBox="0 0 100 60" className="w-full h-full">
                      <defs>
                        <linearGradient id="tagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0d7a8c" />
                          <stop offset="100%" stopColor="#c41e3a" />
                        </linearGradient>
                      </defs>
                      <path d="M10,50 A40,40 0 0 1 90,50" fill="none" stroke="#c41e3a" strokeWidth="18" pathLength={100} />
                      <path
                        d="M10,50 A40,40 0 0 1 90,50"
                        fill="none"
                        stroke="url(#tagGrad)"
                        strokeWidth="18"
                        pathLength={100}
                        strokeDasharray={`${(pct).toFixed(3)} ${(100 - pct).toFixed(3)}`}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )
                })()}
                <div className="absolute left-0 right-0 top-24 flex flex-col items-center justify-center">
                  <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
                    {data?.tagging.percentTagged ?? 0}%
                  </p>
                  <p className="text-base text-gray-600">Asset Tagged</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center">Asset tagging summary</p>
          </div>
        </div>

        {/* Assets Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-medium uppercase tracking-wide mb-6" style={{ color: "#001f3f" }}>
            Assets Overview
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[{
                label: "Assets Not Found",
                value: data?.overview.notFound ?? 0,
                accent: "#fee2e2",
                border: "#fecaca",
                text: "#c41e3a",
              }, {
                label: "Assets In Use",
                value: data?.overview.inUse ?? 0,
                accent: "#e0f2f1",
                border: "#b2dfdb",
                text: "#0d7a8c",
              }, {
                label: "Assets Found",
                value: data?.overview.found ?? 0,
                accent: "#eef2ff",
                border: "#c7d2fe",
                text: "#1e3a8a",
              }].map((item, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: item.accent, border: `1px solid ${item.border}` }}>
                  <p className="text-xs font-medium mb-1" style={{ color: item.text }}>{item.label}</p>
                  <p className="text-3xl font-light" style={{ color: "#001f3f" }}>{item.value}</p>
                </div>
              ))}
            </div>
            
            {/* Recent Assets */}
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: "#0d7a8c" }}>
                Recent Assets
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {(data?.assetDetails?.recentAssets ?? [
                  { id: "A001", name: "MRI Scanner", type: "Medical", location: "Zone A", status: "In Use" },
                  { id: "A002", name: "Ultrasound", type: "Medical", location: "Zone B", status: "Available" },
                  { id: "A003", name: "X-Ray Machine", type: "Medical", location: "Zone C", status: "Maintenance" }
                ]).slice(0, 3).map((asset, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-gray-200">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#001f3f" }}>{asset.name}</p>
                      <p className="text-xs text-gray-500">{asset.location}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      asset.status === 'Available' ? 'bg-green-100 text-green-600' :
                      asset.status === 'In Use' ? 'bg-blue-100 text-blue-600' : 
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: "#0d7a8c" }}>
                Top Categories
              </p>
              <div className="space-y-2">
                {(data?.assetDetails?.topCategories ?? [
                  { name: "Medical Equipment", count: 156 },
                  { name: "IT Equipment", count: 89 },
                  { name: "Furniture", count: 67 }
                ]).slice(0, 3).map((category, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "#001f3f" }}>{category.name}</span>
                    <span className="text-sm font-medium" style={{ color: "#0d7a8c" }}>{category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Zones */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-medium uppercase tracking-wide mb-6" style={{ color: "#001f3f" }}>
            Zones Not Scanned
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#0d7a8c" }}>
                Today
              </span>
              <span className="text-xs text-gray-600">Status</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(data?.zonesNotScanned && data.zonesNotScanned.length > 0 ? data.zonesNotScanned : [
                "ICU", "Emergency", "Radiology", "Surgery", "Pediatrics", "Pharmacy"
              ]).slice(0, 6).map((zone, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-light" style={{ color: "#001f3f" }}>
                    {zone}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                    Unscanned
                  </span>
                </div>
              ))}
            </div>
            {data?.zonesNotScanned && data.zonesNotScanned.length > 6 && (
              <button
                className="w-full text-center text-sm transition-opacity hover:opacity-80 py-2"
                style={{ color: "#0d7a8c" }}
              >
                +{data.zonesNotScanned.length - 6} more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-light mb-6" style={{ color: "#001f3f" }}>
          Visibility and Location
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0d7a8c" }}>
                  Assets Scanned
                </p>
                <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                  {data?.visibility.scanned ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#c41e3a" }}>
                  Assets Not Scanned
                </p>
                <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                  {data?.visibility.notScanned ?? 0}
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, (Number(data?.visibility.scanned ?? 0) / Number(data?.stats.totalAssets || 1)) * 100))}%`, backgroundImage: "linear-gradient(to right, #0d7a8c, #c41e3a)" }}
              ></div>
            </div>
            <div className="mt-4">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
                value={range}
                onChange={(e) => setRange(e.target.value as any)}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
            <button className="mt-4 text-sm transition-opacity hover:opacity-80" style={{ color: "#0d7a8c" }}>
              Today
            </button>
          </div>
          <div className="bg-slate-50 rounded-lg p-0 min-h-64 border border-gray-200">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data?.visibility.trend ?? []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="scanned" stroke="#0d7a8c" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="notScanned" stroke="#c41e3a" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
