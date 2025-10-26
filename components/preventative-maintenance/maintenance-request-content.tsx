"use client"

import { useState, useEffect } from "react"
import { Download, Plus, X, Calendar, AlertCircle } from "lucide-react"

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
  estimatedCost?: number
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
    estimatedCost: ""
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
        estimatedCost: formData.estimatedCost ? parseInt(formData.estimatedCost) : undefined
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
        estimatedCost: ""
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
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Load requests from localStorage on component mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('maintenanceRequests')
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests))
      } catch (error) {
        console.error('Error loading maintenance requests:', error)
      }
    } else {
      // Initialize with some sample data if none exists
      const initialRequests: MaintenanceRequest[] = [
        {
          id: "MR-001",
          status: "Pending",
          requestor: "John Smith",
          category: "Preventive",
          priority: "High",
          urgency: "Urgent",
          department: "Operations",
          description: "Regular maintenance check for infusion pump",
          maintenanceDate: "2025-02-15",
          businessCriticality: "Critical",
          lastModified: "2025-02-10",
          assetName: "Infusion Pump #0001",
          estimatedCost: 250
        },
        {
          id: "MR-002",
          status: "In Progress",
          requestor: "Jane Doe",
          category: "Corrective",
          priority: "Medium",
          urgency: "Normal",
          department: "Engineering",
          description: "Equipment repair needed for ECG monitor",
          maintenanceDate: "2025-02-20",
          businessCriticality: "High",
          lastModified: "2025-02-11",
          assetName: "ECG Monitor #0045",
          estimatedCost: 450
        }
      ]
      setRequests(initialRequests)
      localStorage.setItem('maintenanceRequests', JSON.stringify(initialRequests))
    }
  }, [])

  // Save requests to localStorage whenever requests change
  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem('maintenanceRequests', JSON.stringify(requests))
    }
  }, [requests])

  const handleCreateRequest = (newRequestData: Omit<MaintenanceRequest, 'id' | 'lastModified'>) => {
    const newRequest: MaintenanceRequest = {
      ...newRequestData,
      id: `MR-${(requests.length + 1).toString().padStart(3, '0')}`,
      lastModified: new Date().toISOString().split('T')[0]
    }
    
    setRequests(prev => [newRequest, ...prev])
  }

  const handleDownload = () => {
    const csvContent = [
      ["ID", "Status", "Requestor", "Asset", "Category", "Priority", "Department", "Maintenance Date", "Cost"],
      ...requests.map(req => [
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
  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.assetName && request.assetName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = !statusFilter || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-700 bg-green-100'
      case 'in progress': return 'text-blue-700 bg-blue-100'
      case 'overdue': return 'text-red-700 bg-red-100'
      default: return 'text-orange-700 bg-orange-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
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
              <p className="text-xl font-semibold" style={{ color: "#001f3f" }}>{requests.length}</p>
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
                {requests.filter(r => r.status === 'Pending').length}
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
                {requests.filter(r => r.status === 'Completed').length}
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
                {requests.filter(r => r.priority === 'High' || r.priority === 'Critical').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
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
            Showing {filteredRequests.length} of {requests.length} requests
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
}
