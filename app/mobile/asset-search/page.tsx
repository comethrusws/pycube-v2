"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { 
  Search, Filter, MapPin, List, Scan, Phone, AlertTriangle, 
  Wrench, CheckCircle, Clock, Building, Users, Zap, X, 
  Navigation, Wifi, Battery, Signal, ChevronDown, RefreshCw
} from "lucide-react"
import { apiGet } from "@/lib/fetcher"
import FloorMap from "@/components/mobile/floor-map"
import AILayout from "@/components/dashboard/ai-layout"

interface Asset {
  id: string
  name: string
  type: string
  category: string
  tagId: string
  status: "available" | "in-use" | "maintenance" | "lost"
  utilization: number
  lastActive: string
  department: string
  departmentId: string
  location: {
    building: string
    floor: string
    zone: string
    room: string
    coordinates: { x: number; y: number }
  }
  maintenanceReadiness: "green" | "yellow" | "red"
  lastSeen: string
  serialNumber: string
  value: number
}

interface SearchFilters {
  departments: string[]
  buildings: string[]
  floors: string[]
  types: string[]
  statuses: string[]
}

export default function MobileAssetSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [assets, setAssets] = useState<Asset[]>([])
  const [allAssets, setAllAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showAssetDetail, setShowAssetDetail] = useState(false)
  const [availableFilters, setAvailableFilters] = useState<SearchFilters>({
    departments: [],
    buildings: [],
    floors: [],
    types: [],
    statuses: []
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAssets, setTotalAssets] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const limit = 20 // Show 20 assets per page
  
  // Filter states
  const [filters, setFilters] = useState({
    department: "all",
    building: "all", 
    floor: "all",
    status: "all",
    type: "all"
  })

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  // Debounced search to avoid excessive API calls
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
    // Load initial data
    performSearch(1, true)
  }, [])

  // Debounced search when query changes (always loads up to 20)
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    
    const timer = setTimeout(() => {
      setCurrentPage(1)
      performSearch(1, true)
    }, 300) // 300ms debounce
    
    setSearchDebounceTimer(timer)
    
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }
    }
  }, [searchQuery])

  // Apply local filters (including search text) to the 20 loaded assets
  useEffect(() => {
    const filtered = applyLocalFilters(allAssets, searchQuery, filters)
    setAssets(filtered)
  }, [allAssets, filters, searchQuery])

  const performSearch = async (page: number = 1, reset: boolean = false) => {
    // Always load a single page of up to 20 assets
    setIsLoading(true)
    
    try {
      const queryParams = new URLSearchParams({
        q: searchQuery,
        page: '1',
        limit: limit.toString()
      })

      const response = await apiGet<{
        assets: Asset[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
          hasNext: boolean
          hasPrev: boolean
        }
        filters: SearchFilters
      }>(`/api/mobile/assets/search?${queryParams}`)

      const base = (response.assets || []).slice(0, limit)
      setAllAssets(base)
      setAssets(applyLocalFilters(base, searchQuery, filters))

      // Normalize pagination to a single page
      setCurrentPage(1)
      setTotalPages(1)
      setTotalAssets(response.pagination.total)
      setHasNextPage(false)
      setAvailableFilters(response.filters)
    } catch (error) {
      console.error("Search failed:", error)
      if (reset) {
        setAssets([])
      }
      setTotalAssets(0)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Local filtering within the 20-asset base set
  const applyLocalFilters = (base: Asset[], query: string, f: any): Asset[] => {
    const q = (query || '').toLowerCase().trim()
    return base.filter(a => {
      if (f.department !== 'all' && a.department?.toLowerCase() !== f.department.toLowerCase()) return false
      if (f.building !== 'all' && a.location?.building?.toLowerCase() !== f.building.toLowerCase()) return false
      if (f.floor !== 'all' && a.location?.floor?.toLowerCase() !== f.floor.toLowerCase()) return false
      if (f.status !== 'all' && a.status?.toLowerCase() !== f.status.toLowerCase()) return false
      if (f.type !== 'all' && a.type?.toLowerCase() !== f.type.toLowerCase()) return false
      if (q) {
        const hay = `${a.name} ${a.type} ${a.tagId}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }

  const loadMoreAssets = useCallback(() => {
    if (!isLoadingMore && hasNextPage) {
      performSearch(currentPage + 1, false)
    }
  }, [currentPage, hasNextPage, isLoadingMore])

  const handleAssetAction = async (assetId: string, action: string, notes?: string) => {
    setIsActionLoading(true)
    try {
      const response = await fetch("/api/mobile/assets/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          action,
          userId: "mobile-user-1", // Mock user ID
          notes
        })
      })

      const result = await response.json()
      if (result.success) {
        setActionMessage(result.message)
        
        // Update local asset state
        setAssets(prev => prev.map(asset => 
          asset.id === assetId 
            ? { ...asset, ...result.updatedAsset }
            : asset
        ))

        // Auto-hide message after 3 seconds
        setTimeout(() => setActionMessage(""), 3000)
      }
    } catch (error) {
      console.error("Action failed:", error)
      setActionMessage("Action failed. Please try again.")
      setTimeout(() => setActionMessage(""), 3000)
    } finally {
      setIsActionLoading(false)
    }
  }

  const simulateRFIDScan = () => {
    setIsScanning(true)
    
    // Simulate RFID scan delay
    setTimeout(() => {
      if (assets.length > 0) {
        const randomAsset = assets[Math.floor(Math.random() * assets.length)]
        setSearchQuery(randomAsset.tagId)
        setSelectedAsset(randomAsset)
        setShowAssetDetail(true)
      }
      setIsScanning(false)
    }, 2000)
  }

  // Clear search and reset
  const clearSearch = () => {
    setSearchQuery("")
    setFilters({
      department: "all",
      building: "all", 
      floor: "all",
      status: "all",
      type: "all"
    })
    setCurrentPage(1)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in-use":
        return <Zap className="w-4 h-4 text-blue-600" />
      case "maintenance":
        return <Wrench className="w-4 h-4 text-orange-600" />
      case "lost":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50 border-green-200"
      case "in-use":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "maintenance":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "lost":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getMaintenanceReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "green":
        return "bg-green-500"
      case "yellow":
        return "bg-yellow-500"
      case "red":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <AILayout>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Asset Search & Retrieval</h1>
          <button
            onClick={clearSearch}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, type, or tag ID..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d5c] focus:border-transparent"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.department !== "all" || filters.building !== "all" || filters.status !== "all" || filters.type !== "all") && (
              <span className="bg-[#003d5c] text-white text-xs rounded-full w-2 h-2"></span>
            )}
          </button>
          
          <button
            onClick={simulateRFIDScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-[#003d5c] text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            <Scan className={`w-4 h-4 ${isScanning ? 'animate-pulse' : ''}`} />
            {isScanning ? 'Scanning...' : 'RFID Scan'}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-medium transition-colors ${
              viewMode === "list"
                ? "bg-[#003d5c] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-medium transition-colors ${
              viewMode === "map"
                ? "bg-[#003d5c] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Navigation className="w-4 h-4" />
            Map
          </button>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 mx-4 mt-2 rounded-lg">
          {actionMessage}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Departments</option>
                {availableFilters.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                {availableFilters.statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
              <select
                value={filters.building}
                onChange={(e) => setFilters({ ...filters, building: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Buildings</option>
                {availableFilters.buildings.map(building => (
                  <option key={building} value={building}>{building}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                {availableFilters.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003d5c] mx-auto mb-4"></div>
            <p className="text-gray-600">Searching assets...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {searchQuery && ` for "${searchQuery}"`}
            </div>

            {viewMode === "list" ? (
              /* List View with Infinite Scroll */
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{asset.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{asset.type} • {asset.category}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Building className="w-3 h-3" />
                          <span>{asset.location.building} - {asset.location.floor} - {asset.location.zone}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getMaintenanceReadinessColor(asset.maintenanceReadiness)}`}></div>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                          {getStatusIcon(asset.status)}
                          {asset.status}
                        </div>
                      </div>
                    </div>

                    {/* Asset Details */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Tag ID:</span> {asset.tagId}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span> {asset.department}
                      </div>
                      <div>
                        <span className="font-medium">Last Seen:</span> {new Date(asset.lastSeen).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Room:</span> {asset.location.room}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedAsset(asset)
                          setShowAssetDetail(true)
                        }}
                        className="flex-1 bg-[#003d5c] text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                      >
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Locate
                      </button>
                      
                      {asset.status === "available" && (
                        <button
                          onClick={() => handleAssetAction(asset.id, "retrieve")}
                          disabled={isActionLoading}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Retrieve
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleAssetAction(asset.id, "report_missing", "Reported via mobile app")}
                        disabled={isActionLoading}
                        className="bg-red-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="text-center py-4">
                    <button
                      onClick={loadMoreAssets}
                      disabled={isLoadingMore}
                      className="px-6 py-3 bg-[#003d5c] text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {isLoadingMore ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Load More ({totalAssets - assets.length} remaining)
                        </>
                      )}
                    </button>
                  </div>
                )}

                {assets.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No assets found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search terms or filters</p>
                  </div>
                )}
              </div>
            ) : (
              /* Map View - Only show first page for performance */
              <div>
                {assets.length > 0 ? (
                  <>
                    {assets.length > limit && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <p>Map view shows first {limit} assets for performance. Use filters to narrow results.</p>
                      </div>
                    )}
                    <FloorMap
                      assets={assets.slice(0, limit)} // Only show first page in map view
                      selectedAsset={selectedAsset}
                      onAssetSelect={(asset) => {
                        setSelectedAsset(asset)
                        setShowAssetDetail(true)
                      }}
                      floor={filters.floor === "all" ? assets[0]?.location.floor || "Floor 1" : filters.floor}
                      building={filters.building === "all" ? assets[0]?.location.building || "Building 1" : filters.building}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No assets to display on map</p>
                    <p className="text-gray-500 text-sm">Add search terms or adjust filters to see assets</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Asset Detail Modal */}
      {showAssetDetail && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Asset Details</h3>
              <button
                onClick={() => {
                  setShowAssetDetail(false)
                  setSelectedAsset(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Asset Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedAsset.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{selectedAsset.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tag ID:</span>
                      <p className="font-medium">{selectedAsset.tagId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAsset.status)}`}>
                        {getStatusIcon(selectedAsset.status)}
                        {selectedAsset.status}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <p className="font-medium">{selectedAsset.department}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Location</h5>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{selectedAsset.location.building}</span>
                    </div>
                    <div className="ml-6 text-gray-600">
                      <p>{selectedAsset.location.floor} - {selectedAsset.location.zone}</p>
                      <p>{selectedAsset.location.room}</p>
                    </div>
                  </div>
                </div>

                {/* Maintenance Status */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Maintenance Status</h5>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getMaintenanceReadinessColor(selectedAsset.maintenanceReadiness)}`}></div>
                    <span className="text-sm">
                      {selectedAsset.maintenanceReadiness === "green" && "Ready for use"}
                      {selectedAsset.maintenanceReadiness === "yellow" && "Maintenance due soon"}
                      {selectedAsset.maintenanceReadiness === "red" && "Maintenance overdue"}
                    </span>
                  </div>
                </div>

                {/* Last Activity */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Last Activity</h5>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(selectedAsset.lastSeen).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAssetAction(selectedAsset.id, "locate")}
                  disabled={isActionLoading}
                  className="bg-[#003d5c] text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Locate
                </button>
                
                {selectedAsset.status === "available" && (
                  <button
                    onClick={() => {
                      handleAssetAction(selectedAsset.id, "retrieve")
                      setShowAssetDetail(false)
                    }}
                    disabled={isActionLoading}
                    className="bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Retrieve
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleAssetAction(selectedAsset.id, "maintenance_request", "Issue reported via mobile app")
                    setShowAssetDetail(false)
                  }}
                  disabled={isActionLoading}
                  className="bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <Wrench className="w-4 h-4 inline mr-2" />
                  Request Maintenance
                </button>
                
                <button
                  onClick={() => {
                    handleAssetAction(selectedAsset.id, "report_missing", "Reported missing via mobile app")
                    setShowAssetDetail(false)
                  }}
                  disabled={isActionLoading}
                  className="bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Report Missing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </AILayout>
  )
}
