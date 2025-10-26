"use client"

import { useState, useEffect } from "react"
import { Download, Plus, X, Calendar, AlertCircle, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { apiGet } from "@/lib/fetcher"

interface MaintenanceRequest {
  id: string
  status: string
  requestor: string
  category: string
  priority: string
  urgency: string
  department: string
  description: string
  maintenanceDate: string
  businessCriticality: string
  lastModified: string
  assetName?: string
  assetId?: string
  estimatedCost?: number
  createdBy: string
  assignedTo?: string
}

interface ApiResponse {
  requests: MaintenanceRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
    highPriority: number
    totalCost: number
  }
}

const CreateRequestDialog = ({ isOpen, onClose, onSubmit }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: Omit<MaintenanceRequest, 'id' | 'lastModified'>) => void
}) => {
  const [formData, setFormData] = useState({
    status: "Pending",
    requestor: "",
    category: "Preventive",
    priority: "Medium",
    urgency: "Normal",
    department: "",
    description: "",
    maintenanceDate: "",
    businessCriticality: "Medium",
    assetName: "",
    estimatedCost: "",
    createdBy: "", // Add missing field
    assignedTo: "" // Add missing field (optional but included in interface)
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.requestor.trim()) newErrors.requestor = "Requestor is required"
    if (!formData.department.trim()) newErrors.department = "Department is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.maintenanceDate) newErrors.maintenanceDate = "Maintenance date is required"
    if (!formData.assetName.trim()) newErrors.assetName = "Asset name is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        ...formData,
        estimatedCost: formData.estimatedCost ? parseInt(formData.estimatedCost) : undefined,
        createdBy: formData.requestor, // Use requestor as createdBy
        assignedTo: formData.assignedTo || undefined // Optional field
      })
      
      // Reset form
      setFormData({
        status: "Pending",
        requestor: "",
        category: "Preventive",
        priority: "Medium",  
        urgency: "Normal",
        department: "",
        description: "",
        maintenanceDate: "",
        businessCriticality: "Medium",
        assetName: "",
        estimatedCost: "",
        createdBy: "",
        assignedTo: ""
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-light" style={{ color: "#001f3f" }}>
            Create Maintenance Request
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requestor *
              </label>
              <input
                type="text"
                value={formData.requestor}
                onChange={(e) => setFormData({ ...formData, requestor: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.requestor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } transition-all`}
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
                placeholder="Enter requestor name"
              />
              {errors.requestor && <p className="text-red-500 text-xs mt-1">{errors.requestor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Name *
              </label>
              <input
                type="text"
                value={formData.assetName}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.assetName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } transition-all`}
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
                placeholder="Enter asset name"
              />
              {errors.assetName && <p className="text-red-500 text-xs mt-1">{errors.assetName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.department ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } transition-all`}
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
              >
                <option value="">Select Department</option>
                <option value="Operations">Operations</option>
                <option value="Engineering">Engineering</option>
                <option value="ICU">ICU</option>
                <option value="Emergency">Emergency</option>
                <option value="Radiology">Radiology</option>
                <option value="Surgery">Surgery</option>
                <option value="Clinical Engineering">Clinical Engineering</option>
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
                <option value="Emergency">Emergency</option>
                <option value="Calibration">Calibration</option>
                <option value="Inspection">Inspection</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Criticality
              </label>
              <select
                value={formData.businessCriticality}
                onChange={(e) => setFormData({ ...formData, businessCriticality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Date *
              </label>
              <input
                type="date"
                value={formData.maintenanceDate}
                onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.maintenanceDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } transition-all`}
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.maintenanceDate && <p className="text-red-500 text-xs mt-1">{errors.maintenanceDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost ($)
              </label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter estimated cost"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
                placeholder="Enter assigned technician (optional)"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              } transition-all`}
              style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
              placeholder="Describe the maintenance request in detail..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg transition-opacity hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: "#0d7a8c" }}
            >
              <Plus className="w-4 h-4" />
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in progress":
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
    switch (status.toLowerCase()) {
      case "in progress":
        return "In Progress"
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
    switch (priority.toLowerCase()) {
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

export default function MaintenanceRequestContent() {
  const [data, setData] = useState<MaintenanceRequest[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    highPriority: 0,
    totalCost: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    department: "",
    category: ""
  })

  const fetchData = async (page: number = 1) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })

      const response = await apiGet(`/api/preventative-maintenance/requests?${queryParams}`) as ApiResponse
      setData(response.requests)
      setPagination(response.pagination)
      setSummary(response.summary)
    } catch (error) {
      console.error("Failed to fetch maintenance requests:", error)
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
    fetchData(1)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      department: "",
      category: ""
    })
    setTimeout(() => fetchData(1), 100)
  }

  const handleCreateRequest = async (newRequestData: Omit<MaintenanceRequest, 'id' | 'lastModified'>) => {
    try {
      const response = await fetch('/api/preventative-maintenance/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRequestData),
      })

      if (response.ok) {
        fetchData(pagination.page)
      }
    } catch (error) {
      console.error('Failed to create maintenance request:', error)
    }
  }

  const exportData = () => {
    const csv = [
      "ID,Status,Requestor,Asset,Category,Priority,Department,Maintenance Date,Cost",
      ...data.map(req => 
        `${req.id},"${req.status}","${req.requestor}","${req.assetName || "N/A"}","${req.category}","${req.priority}","${req.department}","${req.maintenanceDate}","${req.estimatedCost || "N/A"}"`
      )
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `maintenance-requests-${new Date().toISOString().split('T')[0]}.csv`
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
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-light mb-2" style={{ color: "#001f3f" }}>
            Maintenance Requests
          </h1>
          <p className="text-gray-600">Create and track equipment maintenance requests</p>
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
          <button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Create Request
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search requests..."
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
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Categories</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Calibration">Calibration</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={filters.department}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  placeholder="Filter by department..."
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
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-light" style={{ color: "#001f3f" }}>{summary.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-light text-orange-600">{summary.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-light text-green-600">{summary.completed}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">High Priority</p>
            <p className="text-2xl font-light text-red-600">{summary.highPriority}</p>
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
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-48">
                    Asset Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Requestor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(pagination.limit)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td colSpan={10} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No maintenance requests found
                    </td>
                  </tr>
                ) : (
                  data.map((request) => (
                    <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <span className="text-lg">⋯</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-teal-600">{request.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 font-medium">{request.assetName || "N/A"}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{request.requestor}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{request.category}</td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={request.priority} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{request.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(request.maintenanceDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {request.estimatedCost ? `$${request.estimatedCost}` : "N/A"}
                      </td>
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

      <CreateRequestDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  )
}
