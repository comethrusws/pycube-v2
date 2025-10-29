"use client"

import { useEffect, useState } from "react"
import { apiGet } from "@/lib/fetcher"
import type { Asset } from "@/lib/types"

export default function AssetDetailsContent({ assetId }: { assetId: string }) {
  const [asset, setAsset] = useState<Asset | null>(null)

  useEffect(() => {
    if (assetId) {
      apiGet<Asset>(`/api/assets/${assetId}`)
        .then((data) => setAsset(data))
        .catch((error) => console.error("Failed to fetch asset data:", error))
    }
  }, [assetId])

  if (!asset) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>
        {asset.name}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
            Asset ID
          </p>
          <p className="text-2xl font-light" style={{ color: "#001f3f" }}>
            {asset.id}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
            Type
          </p>
          <p className="text-2xl font-light" style={{ color: "#001f3f" }}>
            {asset.type}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
            Status
          </p>
          <p className="text-2xl font-light" style={{ color: "#001f3f" }}>
            {asset.status}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
            Utilization
          </p>
          <p className="text-2xl font-light" style={{ color: "#001f3f" }}>
            {asset.utilization}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
            Last Active
          </p>
          <p className="text-2xl font-light" style={{ color: "#001f3f" }}>
            {new Date(asset.lastActive).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
            Maintenance Due
          </p>
          <p className="text-2xl font-light" style={{ color: "#001f3f" }}>
            {new Date(asset.maintenanceDue).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
