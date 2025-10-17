"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Plus, Search, Filter, X } from "lucide-react"
import { apiGet } from "@/lib/fetcher"

interface LocationList {
  id: string
  listId: string
  listName: string
  createdDate: string
  targetCompletionDate: string
  completedDate?: string
  createdBy: string
  assignedGroup: string
  assetCount: number
  updatedBy: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high" | "critical"
  completionPercentage: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "in-progress":
        return "In Progress"
      case "overdue":
        return "Overdue"
      case "pending":
        return "Pending"
      case "completed":
        return "Completed"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <span className={`inline-block items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {formatStatus(status)}
    </span>
  )
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityStyle(priority)}`}>
      {priority.toUpperCase()}
    </span>
  )
}

export default function AssetLocatorContent() {
  const [data, setData] = useState<LocationList[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    listId: "",
    listName: "",
    status: "",
    assignedGroup: "",
    createdBy: "",
  })

  const fetchData = async (page: number = 1) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })

      const response = await apiGet<{
        data: LocationList[]
        pagination: PaginationData
      }>(`/api/asset-locator/location-lists?${queryParams}`)

      setData(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error("Failed to fetch location lists:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePageChange = (newPage: number) => {
    fetchData(newPage)
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchData(1) // Reset to first page when applying filters
  }

  const clearFilters = () => {
    setFilters({
      listId: "",
      listName: "",
      status: "",
      assignedGroup: "",
      createdBy: "",
    })
    setTimeout(() => fetchData(1), 100) // Small delay to ensure state is updated
  }

  const exportData = () => {
    // Mock export functionality
    const csv = [
      "List ID,List Name,Status,Created Date,Target Date,Completed Date,Created By,Assigned Group,Asset Count,Priority",
      ...data.map(item => 
        `${item.listId},"${item.listName}",${item.status},${item.createdDate},${item.targetCompletionDate},${item.completedDate},"${item.createdBy}","${item.assignedGroup}",${item.assetCount},${item.priority}`
      )
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "location-lists.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading && data.length === 0) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-10 bg-gray-200 rounded w-96"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>
            Location Lists
          </h1>
          <p className="text-gray-600">Manage and track asset location verification tasks</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <button 
              onClick={clearFilters}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors duration-200"
            >
              Clear Filters
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors duration-200 flex items-center gap-2"
            >
              <Filter size={16} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <button 
              onClick={exportData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors duration-200 flex items-center gap-2"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors duration-200 flex items-center gap-2">
            <Plus size={16} />
            Create Location List
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">List ID</label>
                <input
                  type="text"
                  value={filters.listId}
                  onChange={(e) => handleFilterChange("listId", e.target.value)}
                  placeholder="Search by List ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                <input
                  type="text"
                  value={filters.listName}
                  onChange={(e) => handleFilterChange("listName", e.target.value)}
                  placeholder="Search by name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Group</label>
                <input
                  type="text"
                  value={filters.assignedGroup}
                  onChange={(e) => handleFilterChange("assignedGroup", e.target.value)}
                  placeholder="Search by group"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <input
                  type="text"
                  value={filters.createdBy}
                  onChange={(e) => handleFilterChange("createdBy", e.target.value)}
                  placeholder="Search by creator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors duration-200"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Total Lists</p>
            <p className="text-2xl font-light" style={{ color: "#001f3f" }}>{pagination.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-light text-green-600">
              {data.filter(item => item.status === "completed").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-light text-blue-600">
              {data.filter(item => item.status === "in-progress").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Overdue</p>
            <p className="text-2xl font-light text-red-600">
              {data.filter(item => item.status === "overdue").length}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                    List ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-48">
                    List Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Target Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Completed Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned Group
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Asset Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(pagination.limit)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td colSpan={12} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      No location lists found
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <span className="text-lg">⋯</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-teal-600">{item.listId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 font-medium">{item.listName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${item.completionPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{item.completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.createdDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.targetCompletionDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.completedDate || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.createdBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.assignedGroup}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.assetCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-600">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrev || isLoading}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronsLeft size={18} className="text-gray-600" />
              </button>
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev || isLoading}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.page - 2) + i
                if (pageNum > pagination.totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                      pageNum === pagination.page
                        ? "bg-teal-600 text-white"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext || isLoading}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
              <button 
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNext || isLoading}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronsRight size={18} className="text-gray-600" />
              </button>
              
              <select 
                value={pagination.limit}
                onChange={(e) => {
                  setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }))
                  fetchData(1)
                }}
                className="ml-4 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
