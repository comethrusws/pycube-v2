"use client"

import { useEffect, useState } from "react"
import { apiGet } from "@/lib/fetcher"
import { useRouter } from "next/navigation"
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Bar, BarChart } from "recharts"
import router from "next/router"

const Accent = "#003d5c"

export default function ComplianceSummaryCard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiGet("/api/compliance/dashboard")
      .then((d) => setData(d))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div onClick={() => router.push("/compliance")} className="bg-white rounded-2xl border p-6 border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1">
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
  )
}