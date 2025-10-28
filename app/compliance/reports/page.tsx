"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function ComplianceReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [reports, setReports] = useState<{ id: string; createdAt: string; summary?: any }[]>([])

  useEffect(() => {
    fetch("/api/compliance/reports")
      .then(r => r.json())
      .then(json => setReports(json.reports || []))
      .catch(() => setReports([]))
  }, [])

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

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>Saved Reports</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-gray-600">No reports yet. Generate one from the Compliance & Risk dashboard.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3">Report ID</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Overall Score</th>
                    <th className="text-left p-3">Fully Compliant</th>
                    <th className="text-left p-3">Overdue Maint.</th>
                    <th className="text-left p-3">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3">{r.id}</td>
                      <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="p-3">{r.summary?.overallScore ?? 0}</td>
                      <td className="p-3">{r.summary?.fullyCompliant ?? 0}</td>
                      <td className="p-3">{r.summary?.overdueMaintenance ?? 0}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <a className="px-3 py-1.5 text-xs border rounded" href={`/api/compliance/reports/${r.id}/pdf`}>PDF</a>
                          <a className="px-3 py-1.5 text-xs border rounded" href={`/api/compliance/reports/${r.id}/xlsx`}>XLSX</a>
                          <a className="px-3 py-1.5 text-xs border rounded" href={`/api/compliance/reports/${r.id}/csv`}>CSV</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


