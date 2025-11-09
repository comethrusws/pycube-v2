"use client"

import type React from "react"
import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { apiGet } from "@/lib/fetcher"
import type { DashboardData } from "@/lib/types"
import ComplianceSummaryCard from "./compliance-summary-card"
import AssetsByFloorCard from "./assets-by-floor-card"
import MaintenanceImpactCard from "./maintenance-impact-card"
import AssetProtectionCards from "./asset-protection-cards"

function DashboardContent() {
  const [data, setData] = useState<DashboardData>()
  const [isLoading, setIsLoading] = useState(true)
  const [range, setRange] = useState<"day" | "week" | "month">("week")
  const router = useRouter()

  useEffect(() => {
    let isCancelled = false
    
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const result = await apiGet<DashboardData>(`/api/core/dashboard?range=${range}`)
        if (!isCancelled) {
          setData(result as any)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch dashboard data:", error)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [range])

  const handleCardClick = useCallback((cardType: string) => {
    switch (cardType) {
      case 'totalAssets':
        router.push('/assets')
        break
      case 'categories':
        router.push('/product-categories')
        break
      case 'facilities':
        router.push('/facilities')
        break
      case 'utilization':
        router.push('/asset-utilization')
        break
      default:
        break
    }
  }, [router])

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data) return null
    
    return {
      timelineData: (data as any).timeline?.map((item: any) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString()
      })) || [],
      utilizationData: (data as any).utilization || []
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>
          Overview
        </h1>
      </div>

      {/* Enhanced Stat Cards with Utilization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { 
            title: "Total Assets", 
            subtitle: "In System", 
            value: data?.stats.totalAssets ?? "-", 
            type: "totalAssets",
            clickable: true 
          },
          { 
            title: "Asset Categories", 
            subtitle: "Category", 
            value: data?.stats.categories ?? "-", 
            type: "categories",
            clickable: true 
          },
          { 
            title: "Total Facilities", 
            subtitle: "Facility", 
            value: data?.stats.totalFacilities ?? "-", 
            type: "facilities",
            clickable: true 
          },
          { 
            title: "Total Users", 
            subtitle: "Active", 
            value: data?.stats.totalUsers ?? "-", 
            type: "users",
            clickable: false 
          },
          {
            title: "Avg Utilization",
            subtitle: "System Wide",
            value: data?.stats.avgUtilization ? `${data.stats.avgUtilization}%` : "-",
            type: "utilization",
            clickable: true
          },
          {
            title: "Underutilized",
            subtitle: "Assets",
            value: data?.stats.underutilizedAssets ?? "-",
            type: "utilization",
            clickable: true
          },
        ].map((card, i) => (
          <div 
            key={i} 
            className={`bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 ${
              card.clickable 
                ? 'hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1' 
                : 'hover:shadow-md'
            }`}
            onClick={() => card.clickable && handleCardClick(card.type)}
          >
            <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
              {card.title}
            </p>
            <p className="text-xs text-gray-600 mb-4">{card.subtitle}</p>
            <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </p>
            {card.clickable && (
              <div className="mt-3 flex items-center text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Click to view details →</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Asset Protection Overview Cards */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <AssetProtectionCards />
        </div>
      </div>

      {/* Charts Section - Updated Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Tagged */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0d7a8c" }}>
                Asset Tagged
              </p>
              <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                {(data?.tagging.tagged ?? 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#c41e3a" }}>
                Untagged
              </p>
              <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                {(data?.tagging.untagged ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-center py-6">
              <div className="relative w-96 h-56">
                {(() => {
                  const pct = Number(data?.tagging.percentTagged ?? 0)
                  const circumference = 2 * Math.PI * 40 * 0.5 // Half circle
                  const strokeDasharray = circumference
                  const strokeDashoffset = circumference - (pct / 100) * circumference
                  
                  return (
                    <svg viewBox="0 0 100 60" className="w-full h-full">
                      {/* Background arc */}
                      <path 
                        d="M10,50 A40,40 0 0 1 90,50" 
                        fill="none" 
                        stroke="#e5e7eb" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                      />
                      {/* Progress arc */}
                      <path 
                        d="M10,50 A40,40 0 0 1 90,50" 
                        fill="none" 
                        stroke="#0d7a8c" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={100 - pct}
                        style={{
                          transition: 'stroke-dashoffset 0.5s ease-in-out'
                        }}
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
                  <p className="text-3xl font-light" style={{ color: "#001f3f" }}>{(item.value ?? 0).toLocaleString()}</p>
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
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2 bg-slate-50 rounded border border-gray-200 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/assets/${asset.id}`)}
                  >
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
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {(data?.zonesNotScanned && data.zonesNotScanned.length > 0 ? data.zonesNotScanned : [
                "ICU", "Emergency", "Radiology", "Surgery", "Orthopedics", "Pharmacy", "Neurology"
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

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AssetsByFloorCard />
          <ComplianceSummaryCard />
          <MaintenanceImpactCard />
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
                  {(data?.visibility.scanned ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#c41e3a" }}>
                  Assets Not Scanned
                </p>
                <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                  {(data?.visibility.notScanned ?? 0).toLocaleString()}
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
                onChange={(e) => setRange(e.target.value as "day" | "week" | "month")}
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
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
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  style={{ fontSize: "12px" }}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                  labelFormatter={(value) => {
                    if (range === "day") return `Time: ${value}`
                    return `Date: ${value}`
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scanned" 
                  stroke="#0d7a8c" 
                  strokeWidth={2} 
                  dot={{ r: 2 }} 
                  name="Scanned"
                />
                <Line 
                  type="monotone" 
                  dataKey="notScanned" 
                  stroke="#c41e3a" 
                  strokeWidth={2} 
                  dot={{ r: 2 }} 
                  name="Not Scanned"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  )
}

export default memo(DashboardContent)
