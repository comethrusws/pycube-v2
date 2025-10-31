"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Filter, Download, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { apiGet } from "@/lib/fetcher"

interface Asset {
  id: string
  name: string
  type: string
  category: string
  status: "available" | "in-use" | "maintenance" | "lost"
  departmentName: string
  location: {
    zoneName: string
  }
  utilization: number
  value: number
  serialNumber: string
  purchaseDate: string
}

export default function AssetsContent() {
  const [data, setData] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    department: "all"
  })

  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "",
    category: "",
    status: "available" as "available" | "in-use" | "maintenance" | "lost",
    departmentName: "",
    location: {
      zoneName: "",
    },
    utilization: 0,
    value: 0,
    serialNumber: "",
    purchaseDate: "",
  })

  useEffect(() => {
    // Apply productId from query if present
    const productId = searchParams.get("productId")
    if (productId) {
      // Trigger load with productId filter embedded in query params
      loadAssets(productId)
    } else {
      loadAssets()
    }
  }, [currentPage, filters, searchParams])

  const loadAssets = async (productId?: string | null) => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "all"))
      })

      if (productId) {
        queryParams.set("productId", productId)
      }

      const response = await apiGet<{
        assets: Asset[]
        total: number
        totalPages: number
      }>(`/api/assets/list?${queryParams}`)

      setData(response.assets)
    } catch (error) {
      console.error("Failed to load assets:", error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      status: "all",
      type: "all", 
      department: "all"
    })
    setSearchTerm("")
    setCurrentPage(1)
  }

  const exportData = () => {
    const csv = [
      "Asset ID,Name,Type,Category,Status,Department,Location,Utilization,Value,Serial Number,Purchase Date",
      ...data.map(item => 
        `${item.id},"${item.name}","${item.type}","${item.category}",${item.status},"${item.departmentName}","${item.location.zoneName}",${item.utilization}%,${item.value},"${item.serialNumber}",${item.purchaseDate}`
      )
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "assets.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddAsset = () => {
    const storedAssets = JSON.parse(localStorage.getItem("assets") || "[]");
    const updatedAssets = [...storedAssets, { ...newAsset, id: `asset-${Date.now()}` }];
    localStorage.setItem("assets", JSON.stringify(updatedAssets));
    setIsModalOpen(false);
    setNewAsset({
      name: "",
      type: "",
      category: "",
      status: "available",
      departmentName: "",
      location: {
        zoneName: "",
      },
      utilization: 0,
      value: 0,
      serialNumber: "",
      purchaseDate: "",
    });
    console.log("Asset added:", newAsset);
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            Assets
          </h1>
          <p className="text-gray-600">Manage and track all your assets</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
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
              Add Asset
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Types</option>
                  <option value="Medical Equipment">Medical Equipment</option>
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicle">Vehicle</option>
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
            </div>
          </div>
        )}

        {/* Assets Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/assets/${asset.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                        <div className="text-sm text-gray-500">{asset.serialNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        asset.status === 'available' ? 'bg-green-100 text-green-800' :
                        asset.status === 'in-use' ? 'bg-blue-100 text-blue-800' :
                        asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.location.zoneName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.departmentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.utilization}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${asset.value.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link href={`/assets/${asset.id}`} className="text-teal-600 hover:text-teal-900">View</Link>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-light mb-4">Add New Asset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input
                  type="text"
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newAsset.status}
                  onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                >
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  value={newAsset.departmentName}
                  onChange={(e) => setNewAsset({ ...newAsset, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={newAsset.location.zoneName}
                  onChange={(e) => setNewAsset({ ...newAsset, location: { zoneName: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="number"
                  value={newAsset.value}
                  onChange={(e) => setNewAsset({ ...newAsset, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                <input
                  type="text"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                <input
                  type="date"
                  value={newAsset.purchaseDate}
                  onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAsset}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg"
              >
                Add Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
