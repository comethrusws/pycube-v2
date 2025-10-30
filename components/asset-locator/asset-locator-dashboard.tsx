"use client"

import { useState, useEffect } from "react"
import { 
  MapPin, Users, Building, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, RefreshCw, ExternalLink, PenToolIcon,
  CircleAlert, Search, Filter,
  AlertCircle,
  Download,
  X
} from "lucide-react"
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'
import { apiGet } from "@/lib/fetcher"

// Enhanced Modal Component
const Modal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-20 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold" style={{ color: "#001f3f" }}>{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Asset Detail Modal Content
const AssetDetailModal = ({ asset, onClose }: { asset: any, onClose: () => void }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionMessage, setActionMessage] = useState("")

  const handleAssetAction = async (action: string, notes?: string) => {
    setIsProcessing(true)
    setActionMessage("")
    
    try {
      const response = await fetch("/api/asset-locator/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          action,
          notes,
          userId: "user-1" // Mock user ID
        })
      })

      const result = await response.json()
      if (result.success) {
        setActionMessage(`✓ ${result.message}`)
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setActionMessage(`✗ ${result.error || "Action failed"}`)
      }
    } catch (error) {
      console.error("Asset action failed:", error)
      setActionMessage("✗ Action failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAnalyzeUsage = () => {
    handleAssetAction("analyze_usage", "Usage pattern analysis requested")
  }

  const handleRelocateAsset = () => {
    handleAssetAction("request_relocation", "Relocation to higher-demand department requested")
  }

  const handleMaintenanceCheck = () => {
    handleAssetAction("schedule_maintenance", "Maintenance check scheduled")
  }

  return (
    <div className="space-y-6">
      {/* Asset Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Asset Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{asset.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type:</span>
              <span>{asset.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                asset.status === 'available' ? 'bg-green-100 text-green-800' :
                asset.status === 'in-use' ? 'bg-blue-100 text-blue-800' :
                asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {asset.status}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Location & Usage</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Location:</span>
              <span>{asset.location.zoneName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department:</span>
              <span>{asset.departmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Utilization:</span>
              <span className="font-medium">{asset.utilization}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          actionMessage.startsWith('✓') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {actionMessage}
        </div>
      )}
      
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleAnalyzeUsage}
            disabled={isProcessing}
            className="p-4 border border-teal-200 rounded-xl hover:bg-teal-50 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-teal-700">Analyze Usage</span>
            </div>
            <p className="text-sm text-gray-600">Analyze usage patterns and optimization opportunities</p>
          </button>
          
          <button 
            onClick={handleRelocateAsset}
            disabled={isProcessing}
            className="p-4 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3 mb-2">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">Relocate Asset</span>
            </div>
            <p className="text-sm text-gray-600">Move to higher-demand department</p>
          </button>
          
          <button 
            onClick={handleMaintenanceCheck}
            disabled={isProcessing}
            className="p-4 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3 mb-2">
              <PenToolIcon className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-700">Maintenance Check</span>
            </div>
            <p className="text-sm text-gray-600">Verify asset condition and functionality</p>
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Monitor Action Modal Content  
const MonitorActionModal = ({ asset, onClose }: { asset: any, onClose: () => void }) => {
  const [selectedAction, setSelectedAction] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Asset Monitoring Action</h4>
            <p className="text-sm text-blue-700 mt-1">
              Configure monitoring parameters for <strong>{asset.name}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Action</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'usage', title: 'Monitor Usage Pattern', desc: 'Track daily utilization and activity' },
              { id: 'location', title: 'Enable Location Tracking', desc: 'Real-time position monitoring' },
              { id: 'maintenance', title: 'Schedule Maintenance Review', desc: 'Proactive maintenance planning' },
              { id: 'alert', title: 'Set Low Utilization Alert', desc: 'Get notified when usage drops below threshold' }
            ].map((action) => (
              <label key={action.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="action"
                  value={action.id}
                  checked={selectedAction === action.id}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedAction === 'alert' && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Utilization Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              defaultValue="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedAction || isSubmitting}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Setting Up...' : 'Start Monitoring'}
        </button>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, bgColor, trend, colorHex }: { label: string; value: string | number; bgColor?: string; trend?: string; colorHex?: string }) => (
  <div className={`${bgColor || ''} text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300`} style={colorHex ? { backgroundColor: colorHex } : undefined}>
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
      top10IdleAssets: any[]
      utilizationTrend: any[]
      maintenanceImpact: any[]
      movementAlerts: any[]
    }
    monitoredCategories: { name: string; value: number; color: string }[]
    locationTrends: { date: string; located: number; unlocated: number }[]
    recordedLocations: { name: string; value: number; color: string }[]
    flaggedReasons: { name: string; value: number; color: string }[]
  }>()

  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "utilization">("utilization")
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [monitorAsset, setMonitorAsset] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [filters, setFilters] = useState({
    department: "all",
    assetType: "all",
    utilizationThreshold: 80,
    dateRange: "30days"
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
    // Apply utilization threshold: show departments with avg utilization <= selected threshold
    return (dept.avgUtilization ?? 0) <= filters.utilizationThreshold
  }) || []

  const filteredAssetTypes = utilization?.assetTypeUtilization?.filter(type => {
    if (filters.assetType !== "all" && type.type !== filters.assetType) return false
    return type.avgUtilization <= filters.utilizationThreshold
  }) || []

  // Filter idle assets based on current filters and search
  const filteredIdleAssets = utilization?.idleAssets?.filter(asset => {
    if (filters.department !== "all" && asset.departmentId !== filters.department) return false
    if (filters.assetType !== "all" && asset.type !== filters.assetType) return false
    return asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           asset.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
           asset.type.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on assets:`, selectedAssets)
    // Implement bulk actions here
    setSelectedAssets([])
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>
            Asset Utilization Dashboard
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 justify-center">
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
          </nav>
        </div>

        {activeTab === "utilization" ? (
          <>
            {/* Enhanced Utilization Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="Average Utilization" 
                value={`${data?.stats.avgUtilization ?? 0}%`}
                colorHex="#003d5c"
              />
              <StatCard 
                label="Underutilized Assets" 
                value={data?.stats.underutilized ?? 0} 
                colorHex="#003d5c"
                trend="< 40% utilization"
              />
              <StatCard 
                label="Movement Alerts" 
                value={utilization?.movementAlerts?.length ?? 0} 
                colorHex="#003d5c"
                trend="Last 48 hours"
              />
              <StatCard 
                label="Idle Assets (Critical)" 
                value={utilization?.top10IdleAssets?.filter(a => a.idleDuration > 30).length ?? 0} 
                colorHex="#003d5c"
                trend="> 30 days idle"
              />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "#001f3f" }}>
                Filter & Analysis Controls
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <option value={40}>Under 40%</option>
                    <option value={60}>Under 60%</option>
                    <option value={80}>Under 80%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select 
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Department Utilization Overview (Bar Graph) */}
            <ChartCard title="Department Utilization Overview">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={filteredDepartments} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="departmentName" 
                      stroke="#9ca3af" 
                      style={{ fontSize: "10px" }}
                      tick={{ fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: "12px" }}
                      tick={{ fill: '#6b7280' }}
                      label={{ value: 'Asset Status %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'available' ? 'Available' : name === 'underMaintenance' ? 'Under Maintenance' : 'Pending Maintenance'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="available" stackId="a" fill="#059669" name="Available" />
                    <Bar dataKey="underMaintenance" stackId="a" fill="#d97706" name="Under Maintenance" />
                    <Bar dataKey="pendingMaintenance" stackId="a" fill="#dc2626" name="Pending Maintenance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Top 10 Idle Assets (Table) and Utilization Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 10 Idle Assets Table */}
              <ChartCard title="Top 10 Idle Assets">
                <div className="space-y-4">
                  {/* Search and Bulk Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    
                    {selectedAssets.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{selectedAssets.length} selected</span>
                        <button
                          onClick={() => handleBulkAction('schedule_review')}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Bulk Review
                        </button>
                        <button
                          onClick={() => handleBulkAction('export')}
                          className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Export
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 w-12">
                            <input
                              type="checkbox"
                              checked={selectedAssets.length === filteredIdleAssets.length && filteredIdleAssets.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAssets(filteredIdleAssets.map(a => a.id))
                                } else {
                                  setSelectedAssets([])
                                }
                              }}
                              className="rounded"
                            />
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900">Asset Name</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900">Department</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900">Last Used</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900">Idle Duration</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900">Utilization</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIdleAssets.map((asset, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 group">
                            <td className="py-3 px-2">
                              <input
                                type="checkbox"
                                checked={selectedAssets.includes(asset.id)}
                                onChange={() => handleAssetSelect(asset.id)}
                                className="rounded"
                              />
                            </td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => setSelectedAsset(asset)}
                                className="text-left hover:text-teal-600 transition-colors"
                              >
                                <div>
                                  <p className="font-medium text-gray-900 group-hover:text-teal-700">{asset.name}</p>
                                  <p className="text-xs text-gray-500">{asset.type}</p>
                                </div>
                              </button>
                            </td>
                            <td className="py-3 px-2 text-gray-700">{asset.department}</td>
                            <td className="py-3 px-2 text-gray-700">
                              {new Date(asset.lastUsed).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                asset.idleDuration > 30 ? 'bg-red-100 text-red-700' :
                                asset.idleDuration > 14 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {asset.idleDuration} days
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      asset.utilization > 30 ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${asset.utilization}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{asset.utilization}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setMonitorAsset(asset)}
                                  className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                                >
                                  <AlertCircle className="w-3 h-3" />
                                  Monitor
                                </button>
                                <button 
                                  onClick={() => setSelectedAsset(asset)}
                                  className="text-xs px-2 py-1.5 text-gray-600 hover:text-teal-600 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredIdleAssets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg mb-2">No idle assets found</p>
                      <p className="text-sm">
                        {searchTerm ? 'Try adjusting your search terms' : 'All assets are being utilized efficiently'}
                      </p>
                    </div>
                  )}
                </div>
              </ChartCard>

              {/* Utilization Trend Over Time - Enhanced Layout */}
              <ChartCard title="Utilization Trend Over Time">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={utilization?.utilizationTrend} 
                      margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#9ca3af" 
                        style={{ fontSize: "11px" }}
                        tick={{ fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={Math.max(0, Math.ceil((utilization?.utilizationTrend?.length || 30) / 8))}
                      />
                      <YAxis 
                        stroke="#9ca3af" 
                        style={{ fontSize: "11px" }}
                        tick={{ fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        domain={[
                          (dataMin: number) => Math.max(0, Math.floor(dataMin / 10) * 10 - 10),
                          (dataMax: number) => Math.min(100, Math.ceil(dataMax / 10) * 10 + 10)
                        ]}
                        width={50}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '12px',
                          fontSize: '12px',
                          padding: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: any, name) => [`${Math.round(value)}%`, 'Utilization Rate']}
                        labelFormatter={(label) => `Date: ${label}`}
                        labelStyle={{ color: '#374151', fontWeight: 'medium' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="utilization" 
                        stroke="#0d7a8c" 
                        strokeWidth={3} 
                        dot={{ fill: "#0d7a8c", strokeWidth: 2, r: 3 }}
                        activeDot={{ 
                          r: 5, 
                          fill: "#0d7a8c", 
                          strokeWidth: 2, 
                          stroke: "#fff",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Add summary stats below the chart */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {utilization?.utilizationTrend?.[utilization.utilizationTrend.length - 1]?.utilization ?? 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Avg (30d)</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {utilization?.utilizationTrend ? 
                          Math.round(utilization.utilizationTrend.reduce((sum, d) => sum + d.utilization, 0) / utilization.utilizationTrend.length)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trend</p>
                      <p className={`text-sm font-semibold ${
                        utilization?.utilizationTrend && utilization.utilizationTrend.length > 1 &&
                        utilization.utilizationTrend[utilization.utilizationTrend.length - 1].utilization > 
                        utilization.utilizationTrend[utilization.utilizationTrend.length - 7].utilization
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {utilization?.utilizationTrend && utilization.utilizationTrend.length > 1 &&
                        utilization.utilizationTrend[utilization.utilizationTrend.length - 1].utilization > 
                        utilization.utilizationTrend[utilization.utilizationTrend.length - 7].utilization
                          ? '↗ Up' : '↘ Down'}
                      </p>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Maintenance Impact and Movement Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Maintenance Impact on Availability (Pie Chart) */}
              <ChartCard title="Maintenance Impact on Availability">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie 
                          data={utilization?.maintenanceImpact} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60}
                          outerRadius={100} 
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {utilization?.maintenanceImpact?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value}% (${props.payload.count} assets)`, 
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
                  <div className="lg:ml-6 mt-4 lg:mt-0 space-y-3">
                    {utilization?.maintenanceImpact?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-700 flex-1">{item.name}</span>
                        <div className="text-right">
                          <span className="font-medium text-gray-900">{item.value}%</span>
                          <p className="text-xs text-gray-500">({item.count} assets)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>

              {/* Asset Movement Alerts (List View) */}
              <ChartCard title="Recent Movement Alerts">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {utilization?.movementAlerts?.slice(0, 8).map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/assets/${alert.assetId}`}>
                              <h4 className="font-medium text-gray-900 text-sm hover:text-teal-600">{alert.assetName}</h4>
                            </Link>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                              alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {alert.alertType}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {alert.fromLocation} → {alert.toLocation}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()} • {alert.movedBy}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            alert.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!utilization?.movementAlerts || utilization.movementAlerts.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent movement alerts</p>
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>
          </>
        ) : (
          <>
            {/* Location Overview Tab - existing content */}
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="Total Monitored Assets" 
                value={data?.stats.total ?? 0} 
                colorHex="#003d5c"
              />
              <StatCard 
                label="Assets to be Located" 
                value={data?.stats.toLocate ?? 0} 
                colorHex="#003d5c"
              />
              <StatCard 
                label="Total Assets Located" 
                value={data?.stats.located ?? 0} 
                colorHex="#003d5c"
              />
              <StatCard 
                label="Total Assets Flagged" 
                value={data?.stats.flagged ?? 0} 
                colorHex="#003d5c"
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
        )}

        {/* Modals */}
        <Modal 
          isOpen={!!selectedAsset} 
          onClose={() => setSelectedAsset(null)}
          title="Asset Details"
        >
          {selectedAsset && (
            <AssetDetailModal 
              asset={selectedAsset} 
              onClose={() => setSelectedAsset(null)} 
            />
          )}
        </Modal>

        <Modal 
          isOpen={!!monitorAsset} 
          onClose={() => setMonitorAsset(null)}
          title="Monitor Asset"
        >
          {monitorAsset && (
            <MonitorActionModal 
              asset={monitorAsset} 
              onClose={() => setMonitorAsset(null)} 
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
