"use client"

import { useState, useEffect } from "react"
import { Download, Plus, X, Calendar, AlertCircle, Search } from "lucide-react"
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold" style={{ color: "#001f3f" }}>
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.requestor ? 'border-red-500' : 'border-gray-300'
                }`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.assetName ? 'border-red-500' : 'border-gray-300'
                }`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.maintenanceDate ? 'border-red-500' : 'border-gray-300'
                }`}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
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
              className="px-6 py-2 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
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

export default function MaintenanceRequestContent() {
  const [data, setData] = useState<ApiResponse>()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")

  // Load maintenance requests from API
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter && { status: statusFilter }),
          ...(priorityFilter && { priority: priorityFilter }),
          ...(departmentFilter && { department: departmentFilter })
        })

        const response = await apiGet(`/api/preventative-maintenance/requests?${params}`) as ApiResponse
        setData(response)
      } catch (error) {
        console.error('Failed to load maintenance requests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [searchTerm, statusFilter, priorityFilter, departmentFilter])

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
        // Refresh the data
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter && { status: statusFilter }),
          ...(priorityFilter && { priority: priorityFilter }),
          ...(departmentFilter && { department: departmentFilter })
        })

        const refreshedData = await apiGet(`/api/preventative-maintenance/requests?${params}`) as ApiResponse
        setData(refreshedData)
      }
    } catch (error) {
      console.error('Failed to create maintenance request:', error)
    }
  }

  const handleDownload = () => {
    if (!data?.requests) return

    const csvContent = [
      ["ID", "Status", "Requestor", "Asset", "Category", "Priority", "Department", "Maintenance Date", "Cost"],
      ...data.requests.map(req => [
        req.id,
        req.status,
        req.requestor,
        req.assetName || "N/A",
        req.category,
        req.priority,
        req.department,
        req.maintenanceDate,
        req.estimatedCost || "N/A"
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maintenance-requests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter requests based on search and status
  const filteredRequests = data?.requests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.assetName && request.assetName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = !statusFilter || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const summary = data?.summary || {
    total: 0,
    pending: 0,
    completed: 0,
    highPriority: 0,
    totalCost: 0
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: "#f0f4f8" }}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light" style={{ color: "#001f3f" }}>
          Maintenance Requests
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg text-white text-sm font-light flex items-center gap-2"
            style={{ backgroundColor: "#0d7a8c" }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-4 py-2 rounded-lg text-white text-sm font-light flex items-center gap-2"
            style={{ backgroundColor: "#0d7a8c" }}
          >
            <Plus className="w-4 h-4" />
            Create Request
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-xl font-semibold" style={{ color: "#001f3f" }}>{summary.total || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-semibold" style={{ color: "#001f3f" }}>
                {summary.pending || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-semibold" style={{ color: "#001f3f" }}>
                {summary.completed || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-xl font-semibold" style={{ color: "#001f3f" }}>
                {summary.highPriority || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              placeholder="Filter by department..."
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>ID</th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>Status</th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>Asset</th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>Requestor</th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>Category</th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>Priority</th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>Department</th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>Due Date</th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e0e0e0" }} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: "#0d7a8c" }}>
                    {request.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.assetName || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.requestor}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.department}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {new Date(request.maintenanceDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.estimatedCost ? `$${request.estimatedCost}` : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No maintenance requests found</p>
          </div>
        )}

        <div
          className="px-4 py-3 flex justify-between items-center"
          style={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #e0e0e0" }}
        >
          <span className="text-sm" style={{ color: "#666" }}>
            Showing {filteredRequests.length} requests
          </span>
          <span className="text-sm" style={{ color: "#666" }}>
            Total Cost: ${summary.totalCost?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      <CreateRequestDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  )

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-700 bg-green-100'
      case 'in progress': return 'text-blue-700 bg-blue-100'
      case 'overdue': return 'text-red-700 bg-red-100'
      default: return 'text-orange-700 bg-orange-100'
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }
}
