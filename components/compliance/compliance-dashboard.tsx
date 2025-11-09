"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { apiGet } from "@/lib/fetcher"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Download, FileSpreadsheet, FileText, Share2 } from "lucide-react"

const Accent = "#003d5c"

export default function ComplianceDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportFilters, setReportFilters] = useState({ startDate: "", endDate: "", departmentId: "", assetType: "" })

  useEffect(() => {
    apiGet("/api/compliance/dashboard")
      .then((d) => setData(d))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [])

  const gaugeColor = useMemo(() => {
    const v = Number(data?.summary?.overallScore ?? 0)
    if (v >= 90) return "#059669"
    if (v >= 70) return "#ea580c"
    return "#dc2626"
  }, [data])

  const riskDonut = useMemo(() => {
    const buckets = { High: 0, Medium: 0, Low: 0 }
    for (const dpt of (data?.summary?.riskByDepartment ?? [])) {
      buckets.High += dpt.high || 0
      buckets.Medium += dpt.medium || 0
      buckets.Low += dpt.low || 0
    }
    return [
      { name: "High", value: buckets.High, color: "#dc2626" },
      { name: "Medium", value: buckets.Medium, color: "#ea580c" },
      { name: "Low", value: buckets.Low, color: "#059669" },
    ]
  }, [data])

  const generateReport = async () => {
    const res = await fetch("/api/compliance/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportFilters)
    })
    const json = await res.json()
    setData((prev: any) => ({ ...prev, report: json }))
    setReportOpen(false)
  }

  const buildAssetRiskRows = (source: any) => [["Asset","Department","Missed Maintenance","Overdue Calibration","Recall","Risk Score"],
    ...((source?.assetRisks || []).map((r: any) => [r.assetName, r.departmentName, r.missedMaintenance, r.overdueCalibration, r.recallFlag ? "Yes" : "No", r.riskScore]))]

  const exportCSV = (useReport = false) => {
    const source = useReport && data?.report ? data.report : data
    const rows = buildAssetRiskRows(source)
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = useReport ? `compliance-report.csv` : `compliance-asset-risks.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportXLSX = (useReport = false) => {
    // Use CSV content with XLSX extension for lightweight export without deps
    const source = useReport && data?.report ? data.report : data
    const rows = buildAssetRiskRows(source)
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = useReport ? `compliance-report.xlsx` : `compliance-asset-risks.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportPDF = (useReport = false) => {
    const source = useReport && data?.report ? data.report : data
    const win = window.open("", "_blank", "width=900,height=700")
    if (!win) return
    const rows = (source?.assetRisks || []).slice(0, 200).map((a: any) => `
      <tr>
        <td style=\"padding:6px;border:1px solid #e5e7eb;\">${a.assetName}</td>
        <td style=\"padding:6px;border:1px solid #e5e7eb;\">${a.departmentName}</td>
        <td style=\"padding:6px;border:1px solid #e5e7eb;\">${a.missedMaintenance}</td>
        <td style=\"padding:6px;border:1px solid #e5e7eb;\">${a.overdueCalibration}</td>
        <td style=\"padding:6px;border:1px solid #e5e7eb;\">${a.recallFlag ? 'Yes' : 'No'}</td>
        <td style=\"padding:6px;border:1px solid #e5e7eb;\">${a.riskScore}</td>
      </tr>
    `).join("")
    const s = source?.summary || {}
    win.document.write(`
      <html><head><title>Compliance Report</title></head>
      <body>
        <h2>Compliance Report</h2>
        <p>Overall Score: ${s.overallScore ?? 0} | Total Assets: ${s.totalAssets ?? 0} | Fully Compliant: ${s.fullyCompliant ?? 0} | Overdue Maintenance: ${s.overdueMaintenance ?? 0} | Avg Risk: ${s.averageRiskScore ?? 0}</p>
        <table style=\"border-collapse:collapse;width:100%;font-family:sans-serif;font-size:12px;\">
          <thead>
            <tr>
              <th style=\"padding:6px;border:1px solid #e5e7eb;\">Asset</th>
              <th style=\"padding:6px;border:1px solid #e5e7eb;\">Department</th>
              <th style=\"padding:6px;border:1px solid #e5e7eb;\">Missed Maintenance</th>
              <th style=\"padding:6px;border:1px solid #e5e7eb;\">Overdue Calibration</th>
              <th style=\"padding:6px;border:1px solid #e5e7eb;\">Recall</th>
              <th style=\"padding:6px;border:1px solid #e5e7eb;\">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <script>window.print()</script>
      </body></html>
    `)
    win.document.close()
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>Compliance & Risk</h1>
      </div>

      {/* Top widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
          title: "Overall Compliance Score",
          value: `${data?.summary?.overallScore ?? 0}`,
          subtitle: "0-100",
        },{
          title: "Total Assets",
          value: (data?.summary?.totalAssets ?? 0).toLocaleString(),
          subtitle: "Monitored",
        },{
          title: "Fully Compliant",
          value: (data?.summary?.fullyCompliant ?? 0).toLocaleString(),
          subtitle: "No issues",
        },{
          title: "Average Risk Score",
          value: (data?.summary?.averageRiskScore ?? 0).toLocaleString(),
          subtitle: "All assets",
        }].map((w, i) => (
          <div key={i} className="rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: Accent, borderColor: "#0b2a3d" }}>
            <p className="text-sm font-medium opacity-90 mb-2 text-white">{w.title}</p>
            <p className="text-4xl font-light text-white">{w.value}</p>
            <p className="text-xs text-white/70 mt-1">{w.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Donut by overall buckets */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light" style={{ color: "#001f3f" }}>Risk Distribution (Non-compliant Assets)</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setReportOpen(true)} className="px-3 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: Accent }}>Generate Report</button>
              <button onClick={() => exportCSV(false)} className="px-3 py-2 text-sm text-gray-700 border rounded-lg flex items-center gap-2"><Download className="w-4 h-4"/>Export CSV</button>
              {data?.report && (
                <div className="relative">
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV(true)} className="px-3 py-2 text-sm text-gray-700 border rounded-lg">Report CSV</button>
                    <button onClick={() => exportXLSX(true)} className="px-3 py-2 text-sm text-gray-700 border rounded-lg">Report XLSX</button>
                    <button onClick={() => exportPDF(true)} className="px-3 py-2 text-sm text-gray-700 border rounded-lg">Report PDF</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-1" style={{ minHeight: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={riskDonut} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {riskDonut.map((e, idx) => (<Cell key={idx} fill={e.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-6 space-y-2 min-w-[200px]">
              {riskDonut.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${i.color}15` }}>
                  <span className="text-sm" style={{ color: i.color }}>{i.name}</span>
                  <span className="text-sm font-semibold" style={{ color: i.color }}>{i.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Noncompliance Trend */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>Noncompliance Trend (30d)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.summary?.noncomplianceTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: Accent }} stroke={Accent} />
                <YAxis tick={{ fontSize: 11, fill: Accent }} stroke={Accent} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="noncompliant" fill={Accent} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per-Asset Table */}
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>Per-Asset Compliance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3">Asset</th>
                <th className="text-left p-3">Department</th>
                <th className="text-left p-3">Missed Maintenance</th>
                <th className="text-left p-3">Overdue Calibration</th>
                <th className="text-left p-3">Recall Flag</th>
                <th className="text-left p-3">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {(data?.report?.assetRisks || data?.assetRisks || []).slice(0, 20).map((r: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">
                    <Link href={`/assets/${r.assetId}`} className="text-blue-700 hover:underline">
                      {r.assetName}
                    </Link>
                  </td>
                  <td className="p-3">{r.departmentName}</td>
                  <td className="p-3">{r.missedMaintenance}</td>
                  <td className="p-3">{r.overdueCalibration}</td>
                  <td className="p-3">{r.recallFlag ? 'Yes' : 'No'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${r.riskScore}%`, backgroundColor: r.riskScore < 70 ? '#dc2626' : r.riskScore < 90 ? '#ea580c' : '#059669' }} />
                      </div>
                      <span className="text-sm font-medium">{r.riskScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border">
            <h3 className="text-lg font-light mb-4" style={{ color: "#001f3f" }}>Generate Compliance Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg" value={reportFilters.startDate} onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">End Date</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg" value={reportFilters.endDate} onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Department (optional)</label>
                <input type="text" placeholder="Department ID" className="w-full px-3 py-2 border rounded-lg" value={reportFilters.departmentId} onChange={(e) => setReportFilters({ ...reportFilters, departmentId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Asset Type (optional)</label>
                <input type="text" placeholder="e.g., Ventilator" className="w-full px-3 py-2 border rounded-lg" value={reportFilters.assetType} onChange={(e) => setReportFilters({ ...reportFilters, assetType: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 text-gray-600" onClick={() => setReportOpen(false)}>Cancel</button>
              <button className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: Accent }} onClick={generateReport}>Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


