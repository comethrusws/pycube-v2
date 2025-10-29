"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, Plus, MapPin, Eye } from "lucide-react"
import { apiGet } from "@/lib/fetcher"

interface LocationList {
  id: string;
  listId: string;
  listName: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  assignedGroup: string;
  createdDate: string;
  assetCount: number;
  completionPercentage: number;
  priority: "low" | "medium" | "high" | "critical";
  department?: string;
  building?: string;
  floor?: string;
}

export default function AssetLocatorContent() {
  const [data, setData] = useState<LocationList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [priority, setPriority] = useState<LocationList['priority']>('medium')
  const [status, setStatus] = useState<LocationList['status']>('pending')
  const [assignedGroup, setAssignedGroup] = useState('CMC Group')

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    department: "all",
    assignedTo: "all"
  })

  useEffect(() => {
    loadLocationLists()
  }, [currentPage, filters])

  const loadLocationLists = async () => {
    const localData = localStorage.getItem('locationLists')
    if (localData) {
      setData(JSON.parse(localData))
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "all"))
      })

      const response = await apiGet<{
        locationLists: LocationList[]
        total: number
        totalPages: number
      }>(`/api/asset-locator/location-lists?${queryParams}`)

      setData(response.locationLists)
    } catch (error) {
      console.error("Failed to load location lists:", error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      department: "all",
      assignedTo: "all"
    })
    setSearchTerm("")
    setCurrentPage(1)
  }

  const exportData = () => {
    const csv = [
      "ID,Name,Description,Status,Assigned To,Created Date,Total Assets,Completion %,Priority",
      ...data.map(item => 
        `${item.listId},"${item.listName}","${item.description}",${item.status},"${item.assignedGroup}",${item.createdDate},${item.assetCount},${item.completionPercentage},${item.priority}`
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

  const filteredData = (data || []).filter(item =>
    (item.listName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.assignedGroup || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
          <div className="flex gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search location lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Create Location List
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Departments</option>
                  <option value="Emergency Department">Emergency Department</option>
                  <option value="ICU">ICU</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Radiology">Radiology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Staff</option>
                  <option value="CMC Group">CMC Group</option>
                  <option value="Biomedical Team">Biomedical Team</option>
                  <option value="Nursing Staff">Nursing Staff</option>
                  <option value="IT Department">IT Department</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Location Lists Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">List</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((list) => (
                  <tr key={list.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{list.listName}</div>
                        <div className="text-sm text-gray-500">{list.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(list.status)}`}>
                        {list.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(list.priority)}`}>
                        {list.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-teal-600 h-2 rounded-full" 
                            style={{ width: `${list.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {list.completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{list.assignedGroup}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{list.createdDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-teal-600 hover:text-teal-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Location List</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const listName = (form.elements.namedItem('listName') as HTMLInputElement).value
              const description = (form.elements.namedItem('description') as HTMLInputElement).value
              
              const newList: LocationList = {
                id: new Date().toISOString(),
                listId: `LL-${Math.random().toString(36).substr(2, 9)}`,
                listName,
                description,
                status: status,
                assignedGroup: assignedGroup,
                createdDate: new Date().toLocaleDateString(),
                assetCount: 0,
                completionPercentage: 0,
                priority: priority,
              }

              const existingLists = JSON.parse(localStorage.getItem('locationLists') || '[]')
              localStorage.setItem('locationLists', JSON.stringify([...existingLists, newList]))
              
              setData([...data, newList])
              setIsModalOpen(false)
            }}>
              <div className="mb-4">
                <label htmlFor="listName" className="block text-sm font-medium text-gray-700">List Name</label>
                <input type="text" id="listName" name="listName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"></textarea>
              </div>
              <div className="mb-4">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                <select id="priority" name="priority" value={priority} onChange={(e) => setPriority(e.target.value as LocationList['priority'])} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as LocationList['status'])} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="assignedGroup" className="block text-sm font-medium text-gray-700">Assigned Group</label>
                <select id="assignedGroup" name="assignedGroup" value={assignedGroup} onChange={(e) => setAssignedGroup(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                  <option value="CMC Group">CMC Group</option>
                  <option value="Biomedical Team">Biomedical Team</option>
                  <option value="Nursing Staff">Nursing Staff</option>
                  <option value="IT Department">IT Department</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Close</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Create List</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
