"use client"

import { useState } from "react"
import { Download, Plus } from "lucide-react"

const maintenanceRequests = [
  {
    id: "MR-001",
    status: "Pending",
    requestor: "John Smith",
    category: "Preventive",
    priority: "High",
    urgency: "Urgent",
    department: "Operations",
    description: "Regular maintenance check",
    maintenanceDate: "2025-02-15",
    businessCriticality: "Critical",
    lastModified: "2025-02-10",
  },
  {
    id: "MR-002",
    status: "In Progress",
    requestor: "Jane Doe",
    category: "Corrective",
    priority: "Medium",
    urgency: "Normal",
    department: "Engineering",
    description: "Equipment repair needed",
    maintenanceDate: "2025-02-20",
    businessCriticality: "High",
    lastModified: "2025-02-11",
  },
]

export default function MaintenanceRequestContent() {
  const [filters, setFilters] = useState({
    maintenanceId: "",
    status: "",
    requestor: "",
    category: "",
    priority: "",
    urgency: "",
    department: "",
    description: "",
  })

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: "#f0f4f8" }}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light" style={{ color: "#001f3f" }}>
          Maintenance Request
        </h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-light flex items-center gap-2"
            style={{ backgroundColor: "#0d7a8c" }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-light flex items-center gap-2"
            style={{ backgroundColor: "#0d7a8c" }}
          >
            <Plus className="w-4 h-4" />
            Create Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Maintenance ID
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Status
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Requestor
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Category
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Priority
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Urgency
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Department
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Description
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Maintenance Date
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Business Criticality
                </th>
                <th className="px-4 py-3 text-left font-light" style={{ color: "#001f3f" }}>
                  Last Modified
                </th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRequests.map((request, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e0e0e0" }} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm" style={{ color: "#0d7a8c" }}>
                    {request.id}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.status}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.requestor}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.category}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.priority}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.urgency}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.department}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.description}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.maintenanceDate}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.businessCriticality}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#001f3f" }}>
                    {request.lastModified}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="px-4 py-3 flex justify-between items-center"
          style={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #e0e0e0" }}
        >
          <span className="text-sm" style={{ color: "#666" }}>
            Showing 1 to {maintenanceRequests.length} of {maintenanceRequests.length} entries
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded text-sm" style={{ backgroundColor: "#e0e0e0", color: "#666" }}>
              Previous
            </button>
            <button className="px-3 py-1 rounded text-sm text-white" style={{ backgroundColor: "#0d7a8c" }}>
              1
            </button>
            <button className="px-3 py-1 rounded text-sm" style={{ backgroundColor: "#e0e0e0", color: "#666" }}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
