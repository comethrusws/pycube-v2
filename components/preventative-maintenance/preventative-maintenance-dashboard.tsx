"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { apiGet } from "@/lib/fetcher"
import PredictiveInsightsTab from "./predictive-insights-tab"

const StatCard = ({ title, value, color, textColor }: { 
  title: string; 
  value: string | number; 
  color: string;
  textColor?: string;
}) => (
  <div className="rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: color }}>
    <p className="text-sm font-medium opacity-90 mb-2" style={{ color: textColor || (color === "#ffffff" ? "#c41e3a" : "white") }}>
      {title}
    </p>
    <p className="text-4xl font-light" style={{ color: textColor || (color === "#ffffff" ? "#001f3f" : "white") }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
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

export default function PreventativeMaintenanceDashboard() {
  const [data, setData] = useState<{
    stats: { totalAssets: number; pending: number; collected: number; pendingCollection: number }
    collectionStatus: Array<{ name: string; value: number; fill: string }>
    assetCategories: Array<{ category: string; collected: number; pending: number }>
    trendData: Array<{ date: string; collected: number; pending: number }>
    upcomingMaintenance: Array<{ asset: string; date: string; type: string }>
    pendingByLocation: Array<{ location: string; count: number }>
    isLoading: boolean
    error: string | null
  }>({
    stats: { totalAssets: 0, pending: 0, collected: 0, pendingCollection: 0 },
    collectionStatus: [],
    assetCategories: [],
    trendData: [],
    upcomingMaintenance: [],
    pendingByLocation: [],
    isLoading: true,
    error: null
  })

  const [activeTab, setActiveTab] = useState<"overview" | "predictive">("overview")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }))
        
        const [
          dashboardResponse,
          collectionStatusResponse,
          categoriesResponse,
          trendResponse,
          upcomingResponse,
          locationResponse
        ] = await Promise.all([
          apiGet<{ stats: { totalMonitoredAssets: number; pmPending: number; pmCollected: number; assetsPendingCollection: number } }>("/api/preventative-maintenance/dashboard"),
          apiGet<{ collectionStatus: Array<{ status: string; count: number; percentage: number }> }>("/api/preventative-maintenance/collection-status"),
          apiGet<{ categories: Array<{ category: string; collected: number; pending: number }> }>("/api/preventative-maintenance/asset-categories"),
          apiGet<{ trend: Array<{ date: string; collected: number; pending: number }> }>("/api/preventative-maintenance/trend"),
          apiGet<{ upcoming: Array<{ asset: string; scheduledDate: string; maintenanceType: string }> }>("/api/preventative-maintenance/upcoming"),
          apiGet<{ locations: Array<{ location: string; pendingCount: number }> }>("/api/preventative-maintenance/pending-by-location")
        ])

        const collectionStatusData = collectionStatusResponse.collectionStatus.map(item => ({
          name: item.status,
          value: item.percentage,
          fill: item.status === "Collected" ? "#0d7a8c" : "#c41e3a"
        }))

        const upcomingMaintenanceData = upcomingResponse.upcoming.map(item => ({
          asset: item.asset,
          date: new Date(item.scheduledDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          type: item.maintenanceType
        }))

        const pendingByLocationData = locationResponse.locations.map(item => ({
          location: item.location,
          count: item.pendingCount
        }))

        setData({
          stats: {
            totalAssets: dashboardResponse.stats.totalMonitoredAssets,
            pending: dashboardResponse.stats.pmPending,
            collected: dashboardResponse.stats.pmCollected,
            pendingCollection: dashboardResponse.stats.assetsPendingCollection
          },
          collectionStatus: collectionStatusData,
          assetCategories: categoriesResponse.categories,
          trendData: trendResponse.trend,
          upcomingMaintenance: upcomingMaintenanceData,
          pendingByLocation: pendingByLocationData,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error("Failed to load preventative maintenance data:", error)
        setData(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Failed to load dashboard data. Please try again later."
        }))
      }
    }

    fetchData()
  }, [])

  if (activeTab === "predictive") {
    return <PredictiveInsightsTab />
  }

  if (data.isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{data.error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
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
            Preventive Maintenance Dashboard
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 justify-center">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Maintenance Overview
            </button>
            <button
              onClick={() => setActiveTab("predictive")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "predictive"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Predictive Insights
            </button>
          </nav>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Monitored Assets" 
            value={data.stats.totalAssets} 
            color="#0d7a8c" 
          />
          <StatCard 
            title="Preventative Maintenance Pending" 
            value={data.stats.pending} 
            color="#ffffff" 
            textColor="#c41e3a"
          />
          <StatCard 
            title="Preventative Maintenance Collected" 
            value={data.stats.collected} 
            color="#0d7a8c" 
          />
          <StatCard 
            title="Assets Pending Collection for PM List" 
            value={data.stats.pendingCollection} 
            color="#059669" 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Collection Status */}
          <ChartCard title="Collection Status Overview">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie 
                      data={data.collectionStatus} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={100} 
                      dataKey="value"
                    >
                      {data.collectionStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:ml-6 mt-4 lg:mt-0 space-y-3">
                {data.collectionStatus.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="text-gray-700 flex-1">{item.name}</span>
                    <span className="font-medium text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Asset Collected vs Pending */}
          <ChartCard title="Asset Categories - Collected vs Pending">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.assetCategories} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 10 }} 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="collected" fill="#0d7a8c" name="Collected" />
                  <Bar dataKey="pending" fill="#c41e3a" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Trend Chart */}
        <ChartCard title="Asset Collected vs Pending Trend">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#9ca3af"
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
                  dataKey="collected" 
                  stroke="#0d7a8c" 
                  strokeWidth={3} 
                  dot={{ fill: "#0d7a8c", r: 4 }} 
                  activeDot={{ r: 6, fill: "#0d7a8c" }}
                  name="Collected"
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#c41e3a" 
                  strokeWidth={3} 
                  dot={{ fill: "#c41e3a", r: 4 }} 
                  activeDot={{ r: 6, fill: "#c41e3a" }}
                  name="Pending"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Additional Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Asset with Pending Collection by Location">
            <div className="space-y-4">
              {data.pendingByLocation.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No pending collections</p>
                  <p className="text-sm">All scheduled maintenance tasks are up to date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.pendingByLocation.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{item.location}</span>
                      <span className="text-red-600 font-semibold">{item.count} pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Maintenance Coming up Next Quarter">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Upcoming Maintenance</h4>
                {data.upcomingMaintenance.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No upcoming maintenance scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.upcomingMaintenance.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{item.asset}</p>
                          <p className="text-gray-500">{item.type}</p>
                        </div>
                        <span className="text-gray-700">{item.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
