"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { apiGet } from "@/lib/fetcher"


import { useRouter } from "next/navigation"


export default function MaintenanceImpactCard() {
  const [data, setData] = useState<any>()
  const router = useRouter()

  useEffect(() => {
    apiGet<typeof data>("/api/asset-locator/dashboard")
      .then((d) => {
        setData(d as any)
      })
      .catch((error) => {
        console.error("Failed to load asset-locator data:", error)
      })
  }, [])

  return (
    <div onClick={() => router.push("/asset-utilization/dashboard")} className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1">
      <h3 className="text-sm font-medium uppercase tracking-wide mb-4" style={{ color: "#001f3f" }}>
        Maintenance Impact on Availability
      </h3>
      <div className="flex flex-col lg:flex-row items-center h-full">
        <div className="flex-1 min-h-[300px] h-full">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={data?.utilization?.maintenanceImpact} 
                cx="50%" 
                cy="50%" 
                innerRadius={60}
                outerRadius={100} 
                paddingAngle={2}
                dataKey="value"
              >
                {data?.utilization?.maintenanceImpact?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  `${value}% (${props.payload.count} assets)`, 
                  name
                ]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:ml-6 mt-4 lg:mt-0 space-y-3">
          {data?.utilization?.maintenanceImpact?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-700 flex-1">{item.name}</span>
              <div className="text-right">
                <span className="font-medium text-gray-900">{item.value}%</span>
                <p className="text-xs text-gray-500">({item.count} assets)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
