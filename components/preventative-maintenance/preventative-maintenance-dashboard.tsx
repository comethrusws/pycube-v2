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

export default function PreventativeMaintenanceDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "insights">("overview")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiGet("/api/pm/dashboard")
        console.log("PM Dashboard Response:", response) // Debug log
        
        if (!response) {
          throw new Error("No data received from API")
        }
        
        setData(response)
      } catch (err) {
        console.error("Failed to fetch PM dashboard data:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">No data available</div>
        </div>
      </div>
    )
  }

  // Safely extract collection status data
  const collectionStatusData = data.collectionStatus?.map((item: any) => ({
    name: item.status,
    value: item.percentage,
    fill: item.status === "Collected" ? "#0d7a8c" : "#c41e3a"
  })) || []

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>
          Preventative Maintenance Dashboard
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "insights"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Predictive Insights
          </button>
        </nav>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Monitored Assets"
              value={data.summary?.totalAssetsMonitored?.toLocaleString() || data.stats?.totalMonitoredAssets?.toLocaleString() || "0"}
              color="#0d7a8c"
            />
            <StatCard
              title="High Risk Assets"
              value={data.summary?.highRiskAssets?.toLocaleString() || "0"}
              color="#dc2626"
            />
            <StatCard
              title="PM Tasks Completed"
              value={data.stats?.pmCollected?.toLocaleString() || "0"}
              color="#059669"
            />
            <StatCard
              title="Potential Savings"
              value={`$${(data.summary?.potentialCostSavings || 0).toLocaleString()}`}
              color="#ffffff"
              textColor="#001f3f"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collection Status Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>
                Collection Status
              </h3>
              {collectionStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={collectionStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {collectionStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No collection status data available
                </div>
              )}
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>
                Risk Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600">High Risk</span>
                  <span className="text-lg font-semibold">{data.summary?.highRiskAssets || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-600">Medium Risk</span>
                  <span className="text-lg font-semibold">{data.summary?.mediumRiskAssets || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">Low Risk</span>
                  <span className="text-lg font-semibold">{data.summary?.lowRiskAssets || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "insights" && (
        <PredictiveInsightsTab />
      )}
    </div>
  )
}
