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

  // Enhanced collection status data processing
  const collectionStatusData = data.collectionStatus?.length > 0 ? 
    data.collectionStatus.map((item: any) => ({
      name: item.status,
      value: item.percentage || Math.round((item.count / (data.stats?.totalMonitoredAssets || 1)) * 100),
      count: item.count,
      fill: item.color || (
        item.status.toLowerCase().includes("completed") ? "#059669" : 
        item.status.toLowerCase().includes("overdue") ? "#dc2626" : 
        "#0d7a8c"
      )
    })) : [
      { name: "No Data", value: 100, count: 0, fill: "#e5e7eb" }
    ]

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
              color="#003d5c"
            />
            <StatCard
              title="High Risk Assets"
              value={data.summary?.highRiskAssets?.toLocaleString() || "0"}
              color="#003d5c"
            />
            <StatCard
              title="PM Tasks Completed"
              value={data.stats?.pmCollected?.toLocaleString() || "0"}
              color="#003d5c"
            />
            <StatCard
              title="Potential Savings"
              value={`$${(data.summary?.potentialCostSavings || 0).toLocaleString()}`}
              color="#003d5c"
              textColor="#ffffff"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Collection Status Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#001f3f" }}>
                  Collection Status
                </h3>
                {data.collectionStatus?.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Total: {data.collectionStatus.reduce((sum: number, item: any) => sum + item.count, 0).toLocaleString()} tasks
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={collectionStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {collectionStatusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${value}% (${Number(props.payload.count || 0).toLocaleString()} tasks)`,
                          name
                        ]}
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
                
                {/* Legend */}
                <div className="ml-6 space-y-3">
                  {collectionStatusData.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: entry.fill }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{entry.name}</p>
                        <p className="text-xs text-gray-500">{Number(entry.count || 0).toLocaleString()} tasks ({entry.value}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Risk Distribution */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>
                Risk Distribution
              </h3>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-900">High Risk</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-red-900">{(data.summary?.highRiskAssets || 0).toLocaleString()}</span>
                      <p className="text-xs text-red-600">Immediate attention required</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-900">Medium Risk</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-900">{(data.summary?.mediumRiskAssets || 0).toLocaleString()}</span>
                      <p className="text-xs text-orange-600">Monitor closely</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-900">Low Risk</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-900">{(data.summary?.lowRiskAssets || 0).toLocaleString()}</span>
                      <p className="text-xs text-green-600">Normal operation</p>
                    </div>
                  </div>
                </div>

                {/* Risk Summary Stats */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Avg Confidence</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {data.summary?.avgConfidenceScore || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Assets</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(data.summary?.totalAssetsMonitored || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
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
