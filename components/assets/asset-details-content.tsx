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
    return <div className="p-6 lg:p-8">Loading...</div>
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>
        {asset.name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Asset Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Asset Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="text-lg font-medium">{asset.serialNumber ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-lg font-medium">{asset.category ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-lg font-medium">{asset.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-medium">{asset.status}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Purchase Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Purchase Date</p>
                <p className="text-lg font-medium">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Warranty Expiry</p>
                <p className="text-lg font-medium">{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Value</p>
                <p className="text-lg font-medium">{asset.value ? `$${asset.value.toLocaleString()}` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Status and Location */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Status & Utilization</h2>
            <div>
              <p className="text-sm text-gray-500">Utilization</p>
              <p className="text-3xl font-light">{asset.utilization}%</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Last Active</p>
              <p className="text-lg font-medium">{new Date(asset.lastActive).toLocaleString()}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Maintenance Due</p>
              <p className="text-lg font-medium">{new Date(asset.maintenanceDue).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Location</h2>
            <div>
              <p className="text-sm text-gray-500">Building</p>
              <p className="text-lg font-medium">{asset.location.buildingId}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Floor</p>
              <p className="text-lg font-medium">{asset.location.floorId}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Zone</p>
              <p className="text-lg font-medium">{asset.location.zoneId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
