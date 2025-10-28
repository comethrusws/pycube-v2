"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function ComplianceReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const exportFormat = async (fmt: "csv" | "xlsx" | "pdf") => {
    setDownloading(fmt)
    // Placeholder: CSV is generated from dashboard; XLSX/PDF could be hooked similarly
    setTimeout(() => setDownloading(null), 800)
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>Compliance Reports</h1>
        <p className="text-gray-600">Generate and export compliance reports for audits and analysis.</p>
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>Quick Export</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: "#003d5c" }} onClick={() => exportFormat("pdf")} disabled={!!downloading}>{downloading === 'pdf' ? 'Exporting…' : 'Export PDF'}</button>
            <button className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: "#003d5c" }} onClick={() => exportFormat("xlsx")} disabled={!!downloading}>{downloading === 'xlsx' ? 'Exporting…' : 'Export XLSX'}</button>
            <button className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: "#003d5c" }} onClick={() => exportFormat("csv")} disabled={!!downloading}>{downloading === 'csv' ? 'Exporting…' : 'Export CSV'}</button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Use the Generate Report action in Compliance & Risk dashboard for filtered reports.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}


