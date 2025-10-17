"use client"

import React, { useState, useEffect } from "react"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { apiGet } from "@/lib/fetcher"

const StatCard = ({
  label,
  value,
  subLabel,
  bgColor,
}: { label: string; value: string | number; subLabel?: string; bgColor: string }) => (
  <div className={`${bgColor} rounded-2xl p-8 text-white shadow-sm hover:shadow-md transition-all duration-300`}>
    <p className="text-sm font-medium opacity-90 mb-2">{label}</p>
    <p className="text-4xl font-light mb-1">{value}</p>
    {subLabel && <p className="text-xs opacity-75">{subLabel}</p>}
  </div>
)

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all duration-300">
    <h3 className="text-sm font-semibold uppercase tracking-wider mb-6" style={{ color: "#001f3f" }}>
      {title}
    </h3>
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

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiGet<typeof data>("/api/asset-locator/dashboard")
      .then((d) => {
        setData(d as any)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load asset-locator data:", error)
        setIsLoading(false)
      })
  }, [])

  const monitoredCategories = data?.monitoredCategories ?? []
  const locationTrends = data?.locationTrends ?? []
  const recordedLocations = data?.recordedLocations ?? []
  const flaggedReasons = data?.flaggedReasons ?? []

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>
            Asset Locator Dashboard
          </h1>
          <p className="text-gray-600">Real-time asset tracking and location intelligence</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Monitored Assets" 
            value={data?.stats.total?.toLocaleString() ?? "-"} 
            bgColor="bg-gradient-to-br from-teal-600 to-teal-700" 
          />
          <StatCard 
            label="Assets to be Located" 
            value={data?.stats.toLocate?.toLocaleString() ?? "-"} 
            bgColor="bg-gradient-to-br from-red-500 to-red-600" 
          />
          <StatCard 
            label="Total Assets Located" 
            value={data?.stats.located?.toLocaleString() ?? "-"} 
            bgColor="bg-gradient-to-br from-teal-500 to-teal-600" 
          />
          <StatCard 
            label="Total Assets Flagged" 
            value={data?.stats.flagged ?? "-"} 
            bgColor="bg-gradient-to-br from-slate-500 to-slate-600" 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monitored Product Categories */}
          <ChartCard title="Monitored Product Categories">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="flex-1 min-h-[320px]">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={monitoredCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {monitoredCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:ml-6 mt-4 lg:mt-0 space-y-3">
                {monitoredCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cat.color }}
                    ></div>
                    <span className="text-gray-700 flex-1">{cat.name}</span>
                    <span className="font-medium text-gray-900">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Asset Tracer Overview */}
          <ChartCard title="Asset Tracking Performance">
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-light mb-1" style={{ color: "#0d7a8c" }}>
                    {data?.stats.located && data?.stats.total 
                      ? Math.round((data.stats.located / data.stats.total) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Tracking Success</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-light mb-1" style={{ color: "#dc2626" }}>
                    {locationTrends.length > 0 
                      ? locationTrends[locationTrends.length - 1]?.located ?? 0
                      : 0}
                  </p>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Assets Found Today</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button className="w-full p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200 text-sm font-medium">
                  Initiate Asset Scan
                </button>
                <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm font-medium">
                  View Location Reports
                </button>
                <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm font-medium">
                  Export Location Data
                </button>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Location Trends Chart */}
        <ChartCard title="Asset Location Trends">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={locationTrends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  style={{ fontSize: "12px" }}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: "12px" }}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="located" 
                  stroke="#0d7a8c" 
                  strokeWidth={3} 
                  dot={{ fill: "#0d7a8c", r: 4 }}
                  activeDot={{ r: 6, fill: "#0d7a8c" }}
                  name="Located Assets"
                />
                <Line 
                  type="monotone" 
                  dataKey="unlocated" 
                  stroke="#dc2626" 
                  strokeWidth={3} 
                  dot={{ fill: "#dc2626", r: 4 }}
                  activeDot={{ r: 6, fill: "#dc2626" }}
                  name="Unlocated Assets"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recorded Asset Locations */}
          <ChartCard title="Asset Location Distribution">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={recordedLocations} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      paddingAngle={1} 
                      dataKey="value"
                    >
                      {recordedLocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:ml-6 mt-4 lg:mt-0 space-y-2 max-h-60 overflow-y-auto">
                {recordedLocations.map((loc, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: loc.color }}
                    ></div>
                    <span className="text-gray-700 flex-1">{loc.name}</span>
                    <span className="font-medium text-gray-900">{loc.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Asset Flagged Reasons */}
          <ChartCard title="Asset Alert Analysis">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={flaggedReasons} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      dataKey="value"
                    >
                      {flaggedReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:ml-6 mt-4 lg:mt-0 space-y-2">
                {flaggedReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: reason.color }}
                    ></div>
                    <span className="text-gray-700 flex-1">{reason.name}</span>
                    <span className="font-medium text-gray-900">{reason.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
