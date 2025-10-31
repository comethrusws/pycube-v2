"use client"

import { useEffect, useState } from "react"
import { apiGet } from "@/lib/fetcher"
import type { Asset, Building, Floor, Zone } from "@/lib/types"
import { MapPin, CheckCircle, Wrench, AlertTriangle, Navigation } from "lucide-react"

export default function AssetDetailsContent({ assetId }: { assetId: string }) {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [building, setBuilding] = useState<Building | null>(null)
  const [floor, setFloor] = useState<Floor | null>(null)
  const [zone, setZone] = useState<Zone | null>(null)
  const [compliance, setCompliance] = useState<any | null>(null)
  const [assetRisk, setAssetRisk] = useState<any | null>(null)
  const [predicted, setPredicted] = useState<any | null>(null)
  const [assetTasks, setAssetTasks] = useState<{ overdue: number; pending: number } | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")

  const handleAssetAction = async (targetAssetId: string, action: string, notes?: string) => {
    try {
      setIsActionLoading(true)
      const response = await fetch("/api/mobile/assets/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: targetAssetId, action, userId: "web-user-1", notes })
      })
      const result = await response.json()
      if (result?.success) {
        setActionMessage(result.message)
        // If API returns updated asset data, reflect it locally
        if (result.updatedAsset) {
          setAsset(prev => prev ? { ...prev, ...result.updatedAsset } : prev)
        }
        setTimeout(() => setActionMessage(""), 3000)
      } else {
        setActionMessage("Action failed. Please try again.")
        setTimeout(() => setActionMessage(""), 3000)
      }
    } catch (e) {
      setActionMessage("Action failed. Please try again.")
      setTimeout(() => setActionMessage(""), 3000)
    } finally {
      setIsActionLoading(false)
    }
  }

  useEffect(() => {
    if (assetId) {
      apiGet<Asset>(`/api/assets/${assetId}`)
        .then((data) => {
          setAsset(data)
          if (data.location.buildingId) {
            apiGet<Building>(`/api/buildings/${data.location.buildingId}`)
              .then(setBuilding)
              .catch((err) => console.error('Failed to fetch building', err))
          }
          if (data.location.floorId) {
            apiGet<Floor>(`/api/floors/${data.location.floorId}`)
              .then(setFloor)
              .catch((err) => console.error('Failed to fetch floor', err))
          }
          if (data.location.zoneId) {
            apiGet<Zone>(`/api/zones/${data.location.zoneId}`)
              .then(setZone)
              .catch((err) => console.error('Failed to fetch zone', err))
          }

          // Load compliance, PM predictive, and maintenance tasks for metrics
          Promise.all([
            apiGet<any>(`/api/compliance/dashboard`).catch(() => null),
            apiGet<any>(`/api/preventative-maintenance/tasks`).catch(() => null),
            apiGet<any>(`/api/preventative-maintenance/predictive`).catch(() => null),
          ])
            .then(([complianceData, tasksData, predictiveData]) => {
              if (complianceData) {
                setCompliance(complianceData)
                const risk = (complianceData.assetRisks || []).find((r: any) => r.assetId === data.id)
                setAssetRisk(risk || null)
              }
              if (tasksData) {
                const tasks = tasksData.tasks || []
                const overdue = tasks.filter((t: any) => t.assetId === data.id && t.status === 'overdue').length
                const pending = tasks.filter((t: any) => t.assetId === data.id && (t.status === 'pending' || t.status === 'in-progress')).length
                setAssetTasks({ overdue, pending })
              }
              if (predictiveData) {
                // Try to find matching entries from predictive datasets
                const atRisk = (predictiveData.top5AtRisk || []).find((x: any) => x.assetId === data.id)
                const insights = (predictiveData.insights || []).filter((x: any) => x.assetId === data.id)
                setPredicted({ atRisk, insights })
              }
            })
            .catch((err) => console.error('Failed to load metrics', err))
        })
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500">Compliance Risk</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-28 bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full" style={{ width: `${assetRisk?.riskScore ?? 0}%`, backgroundColor: (assetRisk?.riskScore ?? 0) < 70 ? '#dc2626' : (assetRisk?.riskScore ?? 0) < 90 ? '#ea580c' : '#059669' }} />
            </div>
            <span className="text-lg font-medium">{assetRisk?.riskScore ?? '-'}{typeof assetRisk?.riskScore === 'number' ? '%' : ''}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500">Predicted Issues</p>
          <p className="text-2xl font-light" style={{ color: "#001f3f" }}>{predicted?.atRisk ? 1 : 0}</p>
          <p className="text-[10px] text-gray-500 mt-1">From predictive maintenance</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500">Overdue Maintenance</p>
          <p className="text-2xl font-light text-red-600">{assetTasks?.overdue ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500">Pending Tasks</p>
          <p className="text-2xl font-light text-amber-600">{assetTasks?.pending ?? 0}</p>
        </div>
      </div>

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

          {/* Compliance Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Compliance</h2>
            {assetRisk ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className="text-lg font-medium">{assetRisk.riskScore}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Missed Maintenance</p>
                  <p className="text-lg font-medium">{assetRisk.missedMaintenance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Overdue Calibration</p>
                  <p className="text-lg font-medium">{assetRisk.overdueCalibration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recall Flag</p>
                  <p className="text-lg font-medium">{assetRisk.recallFlag ? 'Yes' : 'No'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No compliance data available for this asset.</p>
            )}
          </div>

          {/* Predictive Insights */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Predicted Issues</h2>
            {predicted?.atRisk || (predicted?.insights || []).length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {predicted?.atRisk && (
                  <li>Flagged as at-risk by predictive model</li>
                )}
                {(predicted?.insights || []).map((ins: any, idx: number) => (
                  <li key={idx}>{ins.message || 'Potential degradation detected'}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No predicted issues at the moment.</p>
            )}
          </div>
        </div>

        {/* Column 2: Status and Location */}
        <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Actions</h2>
            {actionMessage && (
              <div className="mb-4 px-3 py-2 text-sm rounded bg-blue-50 text-blue-700 border border-blue-200">
                {actionMessage}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAssetAction(asset.id, "locate")}
                disabled={isActionLoading}
                className="bg-[#003d5c] text-white py-2.5 px-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm"
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Locate
              </button>

              {asset.status === "available" && (
                <button
                  onClick={() => handleAssetAction(asset.id, "retrieve")}
                  disabled={isActionLoading}
                  className="bg-blue-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Retrieve
                </button>
              )}

              <button
                onClick={() => handleAssetAction(asset.id, "maintenance_request", "Issue reported via web")}
                disabled={isActionLoading}
                className="bg-orange-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
              >
                <Wrench className="w-4 h-4 inline mr-2" />
                Request Maintenance
              </button>

              <button
                onClick={() => handleAssetAction(asset.id, "report_missing", "Reported missing via web")}
                disabled={isActionLoading}
                className="bg-red-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Report Missing
              </button>

              <button
                onClick={() => handleAssetAction(asset.id, "request_relocation", "Relocation requested via web")}
                disabled={isActionLoading}
                className="bg-teal-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm col-span-2"
              >
                <Navigation className="w-4 h-4 inline mr-2" />
                Request Relocation
              </button>
            </div>
          </div>

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
              <p className="text-lg font-medium">{building ? building.name : asset.location.buildingId}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Floor</p>
              <p className="text-lg font-medium">{floor ? floor.name : asset.location.floorId}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Zone</p>
              <p className="text-lg font-medium">{zone ? zone.name : asset.location.zoneId}</p>
            </div>
          </div>

          {/* Actions */}
        </div>
      </div>
    </div>
  )
}
