"use client"

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

const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
  <div className="rounded-lg p-6 text-white" style={{ backgroundColor: color }}>
    <p className="text-sm font-light opacity-90">{title}</p>
    <p className="text-3xl font-light mt-2">{value}</p>
  </div>
)

const collectionStatusData = [
  { name: "Collected", value: 45, fill: "#0d7a8c" },
  { name: "Pending", value: 55, fill: "#c41e3a" },
]

const assetCategoryData = [
  { category: "Industrial Pumps, Multitherapy", collected: 12, pending: 8 },
  { category: "Centrifuges, Infusion Pump Systems, Programmable", collected: 15, pending: 10 },
  { category: "Infusion Pumps, Infused Feeding", collected: 18, pending: 12 },
  { category: "TELEMETRY", collected: 10, pending: 5 },
]

const trendData = [
  { date: "2025-01-01", collected: 20, pending: 30 },
  { date: "2025-01-08", collected: 25, pending: 28 },
  { date: "2025-01-15", collected: 30, pending: 25 },
  { date: "2025-01-22", collected: 35, pending: 22 },
  { date: "2025-01-29", collected: 40, pending: 18 },
  { date: "2025-02-05", collected: 45, pending: 15 },
]

const pendingLocationData = [{ name: "No records found", value: 0 }]

export default function PreventativeMaintenanceDashboard() {
  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: "#f0f4f8" }}>
      <div>
        <h1 className="text-2xl font-light" style={{ color: "#001f3f" }}>
          Preventative Maintenance Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Monitored Assets" value="155" color="#0d7a8c" />
        <StatCard title="Preventative Maintenance Pending" value="0" color="#ffffff" titleColor="#c41e3a" />
        <StatCard title="Preventative Maintenance Collected" value="0" color="#0d7a8c" />
        <StatCard title="Assets Pending Collection for PM List" value="0" color="#0d7a8c" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>
            Collection Status
          </h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={collectionStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                  {collectionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>
            Asset Collected vs Pending
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" fill="#0d7a8c" />
                <Bar dataKey="pending" fill="#c41e3a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>
          Asset Collected vs Pending Trend
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="collected" stroke="#0d7a8c" strokeWidth={2} dot={{ fill: "#0d7a8c" }} />
              <Line type="monotone" dataKey="pending" stroke="#c41e3a" strokeWidth={2} dot={{ fill: "#c41e3a" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>
          Asset with Pending Collection by Last Read Location
        </h2>
        <div className="text-center py-8 text-gray-500">No records found</div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>
          Maintenance Coming up Next Quarter
        </h2>
        <div className="text-center py-8 text-gray-500">No records found</div>
      </div>
    </div>
  )
}
