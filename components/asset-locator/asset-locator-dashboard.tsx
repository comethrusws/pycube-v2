"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { apiGet } from "@/lib/fetcher"

const StatCard = ({ label, value, bgColor, trend }: { label: string; value: string | number; bgColor: string; trend?: string }) => (
  <div className={`${bgColor} text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300`}>
    <h3 className="text-sm font-medium uppercase tracking-wider opacity-90 mb-2">{label}</h3>
    <p className="text-4xl font-light">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    {trend && <p className="text-sm opacity-80 mt-2">{trend}</p>}
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
    stats: { 
      total: number; 
      toLocate: number; 
      located: number; 
      flagged: number;
      underutilized: number;
      avgUtilization: number;
    }
    utilization: {
      departmentUtilization: any[]
      assetTypeUtilization: any[]
      redistributionSuggestions: any[]
      idleAssets: any[]
    }
    monitoredCategories: { name: string; value: number; color: string }[]
    locationTrends: { date: string; located: number; unlocated: number }[]
    recordedLocations: { name: string; value: number; color: string }[]
    flaggedReasons: { name: string; value: number; color: string }[]
  }>()

  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "utilization">("overview")
  const [filters, setFilters] = useState({
    department: "all",
    assetType: "all",
    utilizationThreshold: 40
  })

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
  const utilization = data?.utilization

  // Filter utilization data based on current filters
  const filteredDepartments = utilization?.departmentUtilization?.filter(dept => {
    if (filters.department !== "all" && dept.departmentId !== filters.department) return false
    return dept.avgUtilization <= filters.utilizationThreshold
  }) || []

  const filteredAssetTypes = utilization?.assetTypeUtilization?.filter(type => {
    if (filters.assetType !== "all" && type.type !== filters.assetType) return false
    return type.avgUtilization <= filters.utilizationThreshold
  }) || []

  const filteredIdleAssets = utilization?.idleAssets?.filter(asset => {
    if (filters.department !== "all" && asset.departmentId !== filters.department) return false
    if (filters.assetType !== "all" && asset.type !== filters.assetType) return false
    return true
  }) || []

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
            Dynamic Asset Utilization Dashboard
          </h1>
          <p className="text-gray-600">Optimize resource deployment through utilization analytics</p>
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
              Location Overview
            </button>
            <button
              onClick={() => setActiveTab("utilization")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "utilization"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Utilization Analytics
            </button>
          </nav>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="Total Monitored Assets" 
                value={data?.stats.total ?? 0} 
                bgColor="bg-gradient-to-br from-teal-600 to-teal-700" 
              />
              <StatCard 
                label="Assets to be Located" 
                value={data?.stats.toLocate ?? 0} 
                bgColor="bg-gradient-to-br from-red-500 to-red-600" 
              />
              <StatCard 
                label="Total Assets Located" 
                value={data?.stats.located ?? 0} 
                bgColor="bg-gradient-to-br from-teal-500 to-teal-600" 
              />
              <StatCard 
                label="Total Assets Flagged" 
                value={data?.stats.flagged ?? 0} 
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
          </>
        ) : (
          <>
            {/* Utilization Analytics Tab */}
            {/* Enhanced Utilization Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="Average Utilization" 
                value={`${data?.stats.avgUtilization ?? 0}%`}
                bgColor="bg-gradient-to-br from-blue-600 to-blue-700" 
              />
              <StatCard 
                label="Underutilized Assets" 
                value={data?.stats.underutilized ?? 0} 
                bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
                trend="< 40% utilization"
              />
              <StatCard 
                label="Redistribution Opportunities" 
                value={utilization?.redistributionSuggestions?.length ?? 0} 
                bgColor="bg-gradient-to-br from-purple-500 to-purple-600" 
              />
              <StatCard 
                label="Idle Assets" 
                value={filteredIdleAssets.length} 
                bgColor="bg-gradient-to-br from-red-500 to-red-600"
                trend="< 20% utilization"
              />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "#001f3f" }}>
                Filter & Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select 
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Departments</option>
                    {utilization?.departmentUtilization?.map(dept => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                  <select 
                    value={filters.assetType}
                    onChange={(e) => setFilters({...filters, assetType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Asset Types</option>
                    {utilization?.assetTypeUtilization?.map(type => (
                      <option key={type.type} value={type.type}>
                        {type.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Utilization Threshold</label>
                  <select 
                    value={filters.utilizationThreshold}
                    onChange={(e) => setFilters({...filters, utilizationThreshold: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={20}>Under 20%</option>
                    <option value={40}>Under 40%</option>
                    <option value={60}>Under 60%</option>
                    <option value={80}>Under 80%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Department Utilization Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Department Utilization Analysis">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredDepartments} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="departmentName" 
                        stroke="#9ca3af" 
                        style={{ fontSize: "10px" }}
                        tick={{ fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
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
                      <Bar dataKey="avgUtilization" fill="#0d7a8c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Asset Type Performance">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredAssetTypes} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="type" 
                        stroke="#9ca3af" 
                        style={{ fontSize: "10px" }}
                        tick={{ fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
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
                      <Bar dataKey="avgUtilization" fill="#7c3aed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Redistribution Suggestions */}
            <ChartCard title="AI-Powered Redistribution Recommendations">
              <div className="space-y-4">
                {utilization?.redistributionSuggestions?.slice(0, 5).map((suggestion, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-semibold text-gray-900">{suggestion.assetName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {suggestion.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Current utilization: <span className="font-medium text-red-600">{suggestion.currentUtilization}%</span>
                        </p>
                        <p className="text-sm text-gray-700">
                          Move from <span className="font-medium">{suggestion.fromDepartment}</span> to{' '}
                          <span className="font-medium">{suggestion.toDepartment}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{suggestion.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{suggestion.potentialImpact}</p>
                        <p className="text-xs text-gray-500">Potential savings: ${suggestion.estimatedSavings}</p>
                        <button className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors">
                          Initiate Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!utilization?.redistributionSuggestions || utilization.redistributionSuggestions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No redistribution opportunities identified at this time.</p>
                  </div>
                )}
              </div>
            </ChartCard>

            {/* Idle Assets Alert */}
            <ChartCard title="Idle Assets Requiring Attention">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIdleAssets.slice(0, 6).map((asset, idx) => (
                  <div key={idx} className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <h4 className="font-semibold text-gray-900 mb-2">{asset.name}</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        Utilization: <span className="font-medium text-red-600">{asset.utilization}%</span>
                      </p>
                      <p className="text-gray-600">Location: {asset.location}</p>
                      <p className="text-gray-600">Idle for: {asset.idleDays} days</p>
                    </div>
                    <button className="mt-3 w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                      Schedule Review
                    </button>
                  </div>
                ))}
                {filteredIdleAssets.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <p>No idle assets found with current filters.</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </>
        )}
      </div>
    </div>
  )
}
