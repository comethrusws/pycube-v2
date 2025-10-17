"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Plus } from "lucide-react"

interface LocationList {
  id: string
  listId: string
  listName: string
  createdDate: string
  targetCompletionDate: string
  completedDate: string
  createdBy: string
  assignedGroup: string
  assetCount: number
  updatedBy: string
}

const mockData: LocationList[] = [
  {
    id: "1",
    listId: "LOC0015",
    listName: "Main Warehouse",
    createdDate: "10/18/2025 10:23:49",
    targetCompletionDate: "10/25/2025",
    completedDate: "10/20/2025",
    createdBy: "Mr. Lawrence",
    assignedGroup: "CMC Group",
    assetCount: 3,
    updatedBy: "Admin",
  },
]

export default function AssetLocatorContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    listId: "",
    listName: "",
    createdDate: "",
    targetDate: "",
    completedDate: "",
    createdBy: "",
    assignedGroup: "",
  })

  const itemsPerPage = 10
  const totalItems = mockData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">Location Lists</h1>

        <div className="flex gap-3 mb-6">
          <button className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium text-sm">
            Clear
          </button>
          <button className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium text-sm flex items-center gap-2">
            <Download size={16} />
            Download
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 font-medium text-sm flex items-center gap-2">
            <Plus size={16} />
            Create Location List
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  List ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  List Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Target Completion Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Completed Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Assigned Group
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Asset Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Updated By
                </th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="flex gap-2">
                      <button className="text-slate-400 hover:text-slate-600">
                        <span className="text-lg">...</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-teal-600 font-medium">{item.listId}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{item.listName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.createdDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.targetCompletionDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.completedDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.assignedGroup}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.assetCount}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.updatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-600">Showing 1 to 1 of 1 entries</span>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-slate-200 rounded disabled:opacity-50" disabled>
                <ChevronsLeft size={18} className="text-slate-600" />
              </button>
              <button className="p-1 hover:bg-slate-200 rounded disabled:opacity-50" disabled>
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              <button className="px-3 py-1 bg-slate-700 text-white rounded text-sm font-medium">1</button>
              <button className="p-1 hover:bg-slate-200 rounded disabled:opacity-50" disabled>
                <ChevronRight size={18} className="text-slate-600" />
              </button>
              <button className="p-1 hover:bg-slate-200 rounded disabled:opacity-50" disabled>
                <ChevronsRight size={18} className="text-slate-600" />
              </button>
              <select className="ml-4 px-2 py-1 border border-slate-300 rounded text-sm">
                <option>100</option>
                <option>50</option>
                <option>25</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
