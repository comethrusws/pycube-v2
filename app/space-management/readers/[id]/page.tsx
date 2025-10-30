"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { apiGet } from "@/lib/fetcher"

export default function ReaderDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<any>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await apiGet<any>(`/api/readers/${params.id}`)
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    if (params?.id) load()
  }, [params?.id])

  return (
    <DashboardLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reader Details</h1>
              <p className="text-sm text-gray-500">ID: {params.id}</p>
            </div>
            <button onClick={() => router.push("/space-management/readers")}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100">Back to Readers</button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">Loading...</div>
          ) : !data?.reader ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">Reader not found</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border p-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Overview</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900">{data.reader.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${data.reader.status === "online" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>{data.reader.status}</span>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Zone</span><span className="font-medium text-gray-900">{data.reader.zoneName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Floor</span><span className="font-medium text-gray-900">{data.reader.floorName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Building</span><span className="font-medium text-gray-900">{data.reader.buildingName}</span></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-6 md:col-span-2">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Assets in Zone</h2>
                  {data.assetsInZone?.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b"><th className="px-3 py-2 text-left">Asset</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Status</th></tr>
                        </thead>
                        <tbody>
                          {data.assetsInZone.map((a: any) => (
                            <tr key={a.id} className="border-b">
                              <td className="px-3 py-2">
                                <Link href={`/assets/${a.id}`} className="text-teal-700 hover:underline">{a.name}</Link>
                              </td>
                              <td className="px-3 py-2">{a.type}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${a.status === "available" ? "bg-green-100 text-green-800 border-green-200" : a.status === "in-use" ? "bg-blue-100 text-blue-800 border-blue-200" : a.status === "maintenance" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>{a.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No assets found in this zone.</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Other Readers in Same Zone</h2>
                {data.siblingReaders?.length ? (
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {data.siblingReaders.map((r: any) => (
                      <li key={r.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-900">{r.name}</span>
                        <Link href={`/space-management/readers/${r.id}`} className="text-xs text-teal-700 hover:underline">View</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">No sibling readers.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


