"use client"

import type React from "react"

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/fetcher"

const StatCard = ({
  label,
  value,
  subLabel,
  bgColor,
}: { label: string; value: string | number; subLabel?: string; bgColor: string }) => (
  <div className={`${bgColor} rounded-lg p-6 text-white`}>
    <p className="text-sm font-medium opacity-90">{label}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
    {subLabel && <p className="text-xs opacity-75 mt-1">{subLabel}</p>}
  </div>
)

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">{title}</h3>
    {children}
  </div>
)

export default function AssetLocatorDashboard() {
  const [data, setData] = useState<{
    stats: { total: number; toLocate: number; located: number; flagged: number }
    monitoredCategories: { name: string; value: number; color: string }[]
    locationTrends: { date: string; located: number; unlocated: number }[]
    recordedLocations: { name: string; value: number; color: string }[]
    flaggedReasons: { name: string; value: number; color: string }[]
  }>()

  useEffect(() => {
    apiGet<typeof data>("/api/asset-locator/dashboard").then((d) => setData(d as any)).catch(() => {})
  }, [])

  const monitoredCategories = data?.monitoredCategories ?? []
  const locationTrends = data?.locationTrends ?? []
  const recordedLocations = data?.recordedLocations ?? []
  const flaggedReasons = data?.flaggedReasons ?? []

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Monitored Assets" value={data?.stats.total ?? "-"} bgColor="bg-teal-700" />
        <StatCard label="Assets to be Located" value={data?.stats.toLocate ?? "-"} bgColor="bg-red-600" />
        <StatCard label="Total Assets Located" value={data?.stats.located ?? "-"} bgColor="bg-teal-600" />
        <StatCard label="Total Assets Flagged" value={data?.stats.flagged ?? "-"} bgColor="bg-slate-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Monitored Product Categories">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={monitoredCategories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {monitoredCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {monitoredCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-slate-600">{cat.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Asset Tracer Overview">
          <div className="h-80 flex items-center justify-center text-slate-400">
            <p className="text-sm">No data available</p>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Asset Location Trends">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={locationTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="located" stroke="#0d7a8c" strokeWidth={2} dot={{ fill: "#0d7a8c", r: 4 }} />
            <Line
              type="monotone"
              dataKey="unlocated"
              stroke="#c41e3a"
              strokeWidth={2}
              dot={{ fill: "#c41e3a", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartCard title="Recorded Asset Locations">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={recordedLocations} cx="50%" cy="50%" outerRadius={100} paddingAngle={2} dataKey="value">
                {recordedLocations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {recordedLocations.map((loc, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: loc.color }}></div>
                <span className="text-slate-600">{loc.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Asset Flagged Reasons">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={flaggedReasons} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                {flaggedReasons.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {flaggedReasons.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: reason.color }}></div>
                <span className="text-slate-600">{reason.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
