"use client"

import { useState, useEffect } from "react"
import { 
  Activity, 
  Filter, 
  Search, 
  Download, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Eye, 
  User, 
  Building, 
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Shield,
  TrendingUp
} from "lucide-react"
import { apiGet } from "@/lib/fetcher"
import Link from "next/link"

interface MovementLog {
  id: string
  assetId: string
  fromZoneId: string
  toZoneId: string
  timestamp: string
  authorized: boolean
  movedBy?: string
  reason?: string
  asset: {
    id: string
    name: string
    type: string
    category: string
    tagId: string
    status: string
    value: number
  } | null
  fromLocation: {
    zoneId: string
    zoneName: string
    floorId?: string
    floorName?: string
    buildingId?: string
    buildingName?: string
  }
  toLocation: {
    zoneId: string
    zoneName: string
    floorId?: string
    floorName?: string
    buildingId?: string
    buildingName?: string
  }
  department: {
    id: string
    name: string
  } | null
  duration: number
  distance: number
  riskLevel: "low" | "medium" | "high" | "critical"
  compliance: {
    authorized: boolean
    reason: string
    reviewer?: string
    reviewDate?: string
  }
}

interface MovementLogsData {
  logs: MovementLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    totalMovements: number
    authorizedMovements: number
    unauthorizedMovements: number
    uniqueAssets: number
    uniqueZones: number
    riskBreakdown: {
      low: number
      medium: number
      high: number
      critical: number
    }
    departmentBreakdown: Record<string, number>
    assetTypeBreakdown: Record<string, number>
  }
  filters: {
    departments: Array<{ id: string; name: string }>
    assetTypes: string[]
    zones: Array<{ id: string; name: string; floorName: string }>
  }
}

// Mock toast function
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.log('❌', message),
  info: (message: string) => console.log('ℹ️', message),
  warning: (message: string) => console.log('⚠️', message)
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = "blue" 
}: {
  icon: any
  label: string
  value: string | number
  color?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    red: "bg-red-50 border-red-200 text-red-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700"
  }
  
  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600", 
    yellow: "text-yellow-600",
    red: "text-red-600",
    purple: "text-purple-600",
    gray: "text-gray-600"
  }
  
  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function MovementLogsContent() {
  const [data, setData] = useState<MovementLogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    assetId: '',
    startDate: '',
    endDate: '',
    unauthorized: '',
    department: '',
    assetType: '',
    zoneId: '',
    riskLevel: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageLimit, setPageLimit] = useState(25)
  const [sortBy, setSortBy] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<MovementLog | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageLimit.toString(),
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })
      
      const response = await apiGet(`/api/asset-protection/movement-logs?${params}`)
      setData(response as MovementLogsData)
    } catch (error) {
      console.error('Failed to load movement logs:', error)
      toast.error('Failed to load movement logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentPage, pageLimit, sortBy, sortOrder, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      assetId: '',
      startDate: '',
      endDate: '',
      unauthorized: '',
      department: '',
      assetType: '',
      zoneId: '',
      riskLevel: ''
    })
    setCurrentPage(1)
  }

  const exportData = () => {
    toast.success('Exporting movement logs... Download will start shortly')
    // In a real implementation, this would generate and download a CSV/Excel file
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Asset Movement Logs
          </h1>
          <p className="text-gray-600 mt-2">
            Historical records of asset movement across zones for compliance and investigation
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Activity}
          label="Total Movements"
          value={data?.summary.totalMovements.toLocaleString() || 0}
          color="blue"
        />
        <StatCard
          icon={Shield}
          label="Authorized"
          value={data?.summary.authorizedMovements.toLocaleString() || 0}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Unauthorized"
          value={data?.summary.unauthorizedMovements.toLocaleString() || 0}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          label="Unique Assets"
          value={data?.summary.uniqueAssets || 0}
          color="purple"
        />
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Assets</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by asset name..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {data?.filters.departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
              <select
                value={filters.assetType}
                onChange={(e) => handleFilterChange('assetType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {data?.filters.assetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
              <select
                value={filters.zoneId}
                onChange={(e) => handleFilterChange('zoneId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Zones</option>
                {data?.filters.zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.floorName})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Authorization</label>
              <select
                value={filters.unauthorized}
                onChange={(e) => handleFilterChange('unauthorized', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Movements</option>
                <option value="false">Authorized Only</option>
                <option value="true">Unauthorized Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Risk Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Risk Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(data?.summary.riskBreakdown || {}).map(([level, count]) => (
            <div key={level} className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-xl font-bold ${getRiskColor(level)}`}>
                {count}
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2 capitalize">{level} Risk</p>
            </div>
          ))}
        </div>
      </div>

      {/* Movement Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Movement History ({data?.pagination.total.toLocaleString() || 0} records)
            </h3>
            
            <div className="flex items-center gap-4">
              <select
                value={pageLimit}
                onChange={(e) => setPageLimit(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="timestamp">Time</option>
                  <option value="assetName">Asset</option>
                  <option value="riskLevel">Risk</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gray-600 hover:text-gray-900"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Authorization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.logs.map((log) => {
                const timestamp = formatTimestamp(log.timestamp)
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <Link 
                            href={`/assets/${log.assetId}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {log.asset?.name || 'Unknown Asset'}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {log.asset?.type} • {log.department?.name}
                          </p>
                          {log.asset?.value && (
                            <p className="text-xs text-gray-400">
                              Value: ${log.asset.value.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">From:</span>
                        </div>
                        <p className="text-xs font-medium">
                          {log.fromLocation.zoneName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.fromLocation.floorName} • {log.fromLocation.buildingName}
                        </p>
                        
                        <div className="flex items-center gap-1 text-gray-600 mt-2 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">To:</span>
                        </div>
                        <p className="text-xs font-medium">
                          {log.toLocation.zoneName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.toLocation.floorName} • {log.toLocation.buildingName}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">{timestamp.date}</p>
                        <p className="text-xs text-gray-500">{timestamp.time}</p>
                        {log.duration > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {log.duration}m ago
                          </p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.authorized 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.authorized ? 'Authorized' : 'Unauthorized'}
                        </span>
                        {log.movedBy && (
                          <div className="text-xs text-gray-500">
                            <User className="w-3 h-3 inline mr-1" />
                            {log.movedBy}
                          </div>
                        )}
                      </div>
                      {log.compliance.reason && (
                        <p className="text-xs text-gray-600 mt-1">
                          {log.compliance.reason}
                        </p>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(log.riskLevel)}`}>
                        {log.riskLevel.charAt(0).toUpperCase() + log.riskLevel.slice(1)}
                      </span>
                      {log.distance > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {log.distance}m distance
                        </p>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {(!data?.logs || data.logs.length === 0) && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No movement logs found</p>
              <p className="text-gray-600">Try adjusting your filters or date range</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(data.pagination.page - 1)}
                  disabled={!data.pagination.hasPrev}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(data.pagination.page + 1)}
                  disabled={!data.pagination.hasNext}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Movement Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Asset Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Asset Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedLog.asset?.name}</p>
                  <p><span className="font-medium">Type:</span> {selectedLog.asset?.type}</p>
                  <p><span className="font-medium">Category:</span> {selectedLog.asset?.category}</p>
                  <p><span className="font-medium">Tag ID:</span> {selectedLog.asset?.tagId}</p>
                  <p><span className="font-medium">Department:</span> {selectedLog.department?.name}</p>
                  {selectedLog.asset?.value && (
                    <p><span className="font-medium">Value:</span> ${selectedLog.asset.value.toLocaleString()}</p>
                  )}
                </div>
              </div>

              {/* Movement Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Movement Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium text-green-700">From Location:</p>
                    <p className="text-sm text-gray-600 ml-4">
                      {selectedLog.fromLocation.zoneName}<br />
                      {selectedLog.fromLocation.floorName} • {selectedLog.fromLocation.buildingName}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">To Location:</p>
                    <p className="text-sm text-gray-600 ml-4">
                      {selectedLog.toLocation.zoneName}<br />
                      {selectedLog.toLocation.floorName} • {selectedLog.toLocation.buildingName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <p><span className="font-medium">Distance:</span> {selectedLog.distance}m</p>
                    <p><span className="font-medium">Duration:</span> {selectedLog.duration}m ago</p>
                  </div>
                </div>
              </div>

              {/* Compliance Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Compliance & Authorization</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedLog.authorized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedLog.authorized ? 'Authorized' : 'Unauthorized'}
                    </span>
                  </div>
                  <p><span className="font-medium">Risk Level:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedLog.riskLevel)}`}>
                      {selectedLog.riskLevel.charAt(0).toUpperCase() + selectedLog.riskLevel.slice(1)}
                    </span>
                  </p>
                  <p><span className="font-medium">Reason:</span> {selectedLog.compliance.reason}</p>
                  {selectedLog.movedBy && (
                    <p><span className="font-medium">Moved by:</span> {selectedLog.movedBy}</p>
                  )}
                  {selectedLog.compliance.reviewer && (
                    <p><span className="font-medium">Reviewed by:</span> {selectedLog.compliance.reviewer}</p>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Timestamp</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{formatTimestamp(selectedLog.timestamp).date}</p>
                  <p className="text-sm text-gray-600">{formatTimestamp(selectedLog.timestamp).time}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}