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

// Static data for now - can be replaced with API calls later
const collectionStatusData = [
  { name: "Collected", value: 45, fill: "#0d7a8c" },
  { name: "Pending", value: 55, fill: "#c41e3a" },
]

const assetCategoryData = [
  { category: "Infusion Pumps", collected: 12, pending: 8 },
  { category: "Centrifuges", collected: 15, pending: 10 },
  { category: "ECG Monitors", collected: 18, pending: 12 },
  { category: "Ventilators", collected: 10, pending: 5 },
  { category: "Ultrasound", collected: 8, pending: 3 },
]

const trendData = [
  { date: "01/01", collected: 20, pending: 30 },
  { date: "01/08", collected: 25, pending: 28 },
  { date: "01/15", collected: 30, pending: 25 },
  { date: "01/22", collected: 35, pending: 22 },
  { date: "01/29", collected: 40, pending: 18 },
  { date: "02/05", collected: 45, pending: 15 },
]

export default function PreventativeMaintenanceDashboard() {
  const [data, setData] = useState<{
    stats: { totalAssets: number; pending: number; collected: number; pendingCollection: number }
    isLoading: boolean
  }>({
    stats: { totalAssets: 2012, pending: 340, collected: 1672, pendingCollection: 28 },
    isLoading: false
  })

  // Simulate API call
  useEffect(() => {
    // In a real implementation, this would be an API call
    // apiGet("/api/preventative-maintenance/dashboard").then(setData)
  }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>
            Preventative Maintenance Dashboard
          </h1>
          <p className="text-gray-600">Comprehensive maintenance tracking and scheduling</p>
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
                      data={collectionStatusData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={100} 
                      dataKey="value"
                    >
                      {collectionStatusData.map((entry, index) => (
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
                {collectionStatusData.map((item, idx) => (
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
                <BarChart data={assetCategoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No pending collections</p>
                <p className="text-sm">All scheduled maintenance tasks are up to date</p>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Maintenance Coming up Next Quarter">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Upcoming Maintenance</h4>
                <div className="space-y-3">
                  {[
                    { asset: "MRI Scanner #001", date: "Mar 15, 2025", type: "Preventive" },
                    { asset: "CT Scanner #003", date: "Mar 22, 2025", type: "Calibration" },
                    { asset: "Ventilator #045", date: "Apr 5, 2025", type: "Inspection" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.asset}</p>
                        <p className="text-gray-500">{item.type}</p>
                      </div>
                      <span className="text-gray-700">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
