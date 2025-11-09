"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Plus, Search, Filter, Package, Tag, DollarSign } from "lucide-react"
import { apiGet } from "@/lib/fetcher"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { useApi } from "@/lib/hooks/useApi"

interface Product {
  id: string
  name: string
  description?: string
  category?: string
  manufacturer?: string
  model?: string
  price?: number
  sku?: string
  status?: "active" | "discontinued" | "out-of-stock" | "inactive"
  createdAt?: string
  updatedAt?: string
  totalAssets: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const StatusBadge = memo(({ status = "inactive" }: { status?: string }) => {
  const getStatusStyle = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "discontinued":
        return "bg-red-100 text-red-800 border-red-200"
      case "out-of-stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }, [])

  const statusStyle = useMemo(() => getStatusStyle(status), [status, getStatusStyle])

  return (
    <span className={`inline-block items-center px-2.5 py-0.5 rounded-full text-xs font-medium border smooth-transition ${statusStyle}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  )
})

export default function ProductsContent() {
  const [data, setData] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    manufacturer: "",
    status: "",
    sku: "",
  })

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    manufacturer: "",
    model: "",
    price: 0,
    sku: "",
    status: "active" as "active" | "discontinued" | "out-of-stock" | "inactive",
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
        products: Product[]
        pagination: PaginationData
      }>(`/api/products/list?${queryParams}`)

      setData(response.products)
      setPagination(response.pagination)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryFilter = searchParams.get('category')

  useEffect(() => {
    if (categoryFilter) {
      setFilters(prev => ({ ...prev, category: categoryFilter }))
    }
  }, [categoryFilter])

  useEffect(() => {
    fetchData()
  }, [filters])

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
      name: "",
      category: "",
      manufacturer: "",
      status: "",
      sku: "",
    })
    setTimeout(() => fetchData(1), 100)
  }

  const exportData = () => {
    const csv = [
      "Product ID,Name,Description,Category,Manufacturer,Model,Price,SKU,Status,Total Assets,Created Date",
      ...data.map(item => 
        `${item.id},"${item.name}","${item.description || ''}","${item.category || ''}","${item.manufacturer || ''}","${item.model || ''}",${item.price || 'N/A'},"${item.sku || ''}",${item.status},${item.totalAssets},${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}`
      )
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddProduct = () => {
    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");
    const updatedProducts = [...storedProducts, { ...newProduct, id: `prod-${Date.now()}` }];
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setIsModalOpen(false);
    setNewProduct({
      name: "",
      description: "",
      category: "",
      manufacturer: "",
      model: "",
      price: 0,
      sku: "",
      status: "active",
    });
    console.log("Product added:", newProduct);
  };

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
            Products Management
          </h1>
          <p className="text-gray-600">Manage product catalog and specifications</p>
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
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  placeholder="Search by name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  placeholder="Search by category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={filters.manufacturer}
                  onChange={(e) => handleFilterChange("manufacturer", e.target.value)}
                  placeholder="Search by manufacturer"
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
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={filters.sku}
                  onChange={(e) => handleFilterChange("sku", e.target.value)}
                  placeholder="Search by SKU"
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
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-light" style={{ color: "#001f3f" }}>{pagination.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-light text-green-600">
              {data.filter(item => item.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Discontinued</p>
            <p className="text-2xl font-light text-red-600">
              {data.filter(item => item.status === "discontinued").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-2xl font-light text-yellow-600">
              {data.filter(item => item.status === "out-of-stock").length}
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
                    Product Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Manufacturer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Assets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(pagination.limit)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  data.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => router.push(`/assets?productId=${product.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                          <p className="text-xs text-gray-500">Model: {product.model}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{product.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{product.manufacturer}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">${product.price?.toLocaleString() || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{product.totalAssets}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - same as assets */}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-light mb-4">Add New Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                <input
                  type="text"
                  value={newProduct.manufacturer}
                  onChange={(e) => setNewProduct({ ...newProduct, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={newProduct.model}
                  onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                >
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                onClick={handleAddProduct}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
