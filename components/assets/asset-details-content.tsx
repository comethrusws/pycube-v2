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
  const [assetProtection, setAssetProtection] = useState<any | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  const [degradationTrend, setDegradationTrend] = useState<Array<{ date: string; score: number }>>([])

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

          // Load compliance, PM predictive, maintenance tasks, and asset protection metrics
          Promise.all([
            apiGet<any>(`/api/compliance/dashboard`).catch(() => null),
            apiGet<any>(`/api/preventative-maintenance/tasks`).catch(() => null),
            apiGet<any>(`/api/preventative-maintenance/predictive`).catch(() => null),
            apiGet<any>(`/api/asset-protection/assets/${data.id}`).catch(() => null),
          ])
            .then(([complianceData, tasksData, predictiveData, protectionData]) => {
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

                // Pull degradation trend per asset if present
                const trendEntry = (predictiveData.degradationTrends || []).find((t: any) => t.assetId === data.id || t.assetName === data.name)
                if (trendEntry?.trend?.length) {
                  setDegradationTrend(trendEntry.trend.map((p: any) => ({ date: p.date, score: p.degradationScore ?? p.score ?? p.value ?? 0 })))
                } else {
                  // Fallback: synthesize a short trend around current utilization
                  const base = Math.max(40, Math.min(95, Number(data.utilization) || 70))
                  const series = Array.from({ length: 7 }, (_, i) => ({ date: String(i), score: Math.max(30, Math.min(100, Math.round(base + (Math.sin(i) * 8)))) }))
                  setDegradationTrend(series)
                }
              }
              if (protectionData) {
                setAssetProtection(protectionData)
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>{asset.name}</h1>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium ${asset.status === 'in-use' ? 'text-blue-700' : asset.status === 'maintenance' ? 'text-amber-700' : asset.status === 'available' ? 'text-green-700' : 'text-gray-700'}`}>{asset.status}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-2xl p-6 border">
          <p className="text-xs text-gray-500">Compliance Risk</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-28 bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full" style={{ width: `${assetRisk?.riskScore ?? 0}%`, backgroundColor: (assetRisk?.riskScore ?? 0) < 70 ? '#dc2626' : (assetRisk?.riskScore ?? 0) < 90 ? '#ea580c' : '#059669' }} />
            </div>
            <span className="text-lg font-medium">{assetRisk?.riskScore ?? '-'}{typeof assetRisk?.riskScore === 'number' ? '%' : ''}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border">
          <p className="text-xs text-gray-500">Protection Risk</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-28 bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full" style={{ 
                width: `${assetProtection?.riskScore ?? 0}%`, 
                backgroundColor: (assetProtection?.riskScore ?? 0) >= 75 ? '#dc2626' : 
                               (assetProtection?.riskScore ?? 0) >= 50 ? '#ea580c' : 
                               (assetProtection?.riskScore ?? 0) >= 25 ? '#f59e0b' : '#059669' 
              }} />
            </div>
            <span className="text-lg font-medium">{assetProtection?.riskScore ?? 0}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border">
          <p className="text-xs text-gray-500">Security Violations</p>
          <p className="text-2xl font-light text-red-600">{assetProtection?.summary?.totalViolations ?? 0}</p>
          <p className="text-[10px] text-gray-500 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border">
          <p className="text-xs text-gray-500">Active Alerts</p>
          <p className="text-2xl font-light text-orange-600">{assetProtection?.summary?.activeAlerts ?? 0}</p>
          <p className="text-[10px] text-gray-500 mt-1">Require attention</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border">
          <p className="text-xs text-gray-500">Overdue Maintenance</p>
          <p className="text-2xl font-light text-red-600">{assetTasks?.overdue ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border">
          <p className="text-xs text-gray-500">Pending Tasks</p>
          <p className="text-2xl font-light text-amber-600">{assetTasks?.pending ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Asset Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border">
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

                    {/* Asset Protection */}
          {asset.tagId && (
            <div className="bg-white rounded-2xl p-6 border">
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Asset Protection</h2>
              {assetProtection ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Compliance Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${
                          assetProtection.complianceStatus === 'compliant' ? 'bg-green-500' :
                          assetProtection.complianceStatus === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-lg font-medium capitalize">{assetProtection.complianceStatus?.replace('-', ' ')}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Movement Activity</p>
                      <p className="text-lg font-medium">{assetProtection.summary?.recentMovements} movements</p>
                      <p className="text-xs text-gray-400">Last 30 days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Zone Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${assetProtection.geofenceStatus?.inAuthorizedZone ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-lg font-medium">{assetProtection.geofenceStatus?.inAuthorizedZone ? 'Authorized' : 'Unauthorized'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {(assetProtection.violations?.length > 0 || assetProtection.alerts?.length > 0) && (
                    <div className="mt-6">
                      <h3 className="text-md font-medium mb-3" style={{ color: "#001f3f" }}>Recent Security Events</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {assetProtection.violations?.slice(0, 3).map((violation: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                            <div>
                              <p className="text-sm font-medium text-red-800">{violation.description}</p>
                              <p className="text-xs text-red-600">
                                {violation.fromZoneName} → {violation.toZoneName} • {new Date(violation.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              violation.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {violation.status}
                            </span>
                          </div>
                        ))}
                        {assetProtection.alerts?.slice(0, 2).map((alert: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div>
                              <p className="text-sm font-medium text-orange-800">{alert.message}</p>
                              <p className="text-xs text-orange-600">{new Date(alert.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              alert.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading asset protection data...</p>
              )}
            </div>
          )}


          <div className="bg-white rounded-2xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "#001f3f" }}>Health Trend</h2>
              <span className="text-xs text-gray-500">Last 7 points</span>
            </div>
            {/* Lightweight sparkline */}
            <div className="h-24">
              <svg viewBox="0 0 120 48" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#0d7a8c"
                  strokeWidth="2"
                  points={degradationTrend.map((p, i) => `${(i/(Math.max(1,degradationTrend.length-1)))*120},${48 - (p.score/100)*48}`).join(" ")}
                />
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Warranty Expiry</p>
                <p className="text-lg font-medium">{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Value</p>
                <p className="text-lg font-medium">{asset.value ? `$${asset.value.toLocaleString()}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Purchase Date</p>
                <p className="text-lg font-medium">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Compliance Details */}
          <div className="bg-white rounded-2xl p-6 border">
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
          <div className="bg-white rounded-2xl p-6 border">
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
        <div className="bg-white rounded-2xl p-6 border">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#001f3f" }}>Asset Actions</h2>
            {actionMessage && (
              <div className="mb-4 px-3 py-2 text-sm rounded bg-blue-50 text-blue-700 border border-blue-200">
                {actionMessage}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAssetAction(asset.id, "locate", `Location requested for ${asset.name}`)}
                disabled={isActionLoading}
                className="bg-[#003d5c] text-white py-2.5 px-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm"
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Locate Asset
              </button>

              {asset.status === "available" && (
                <button
                  onClick={() => handleAssetAction(asset.id, "retrieve", `${asset.name} checked out for use`)}
                  disabled={isActionLoading}
                  className="bg-blue-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Check Out
                </button>
              )}

              {asset.status === "in-use" && (
                <button
                  onClick={() => handleAssetAction(asset.id, "return", `${asset.name} returned and available`)}
                  disabled={isActionLoading}
                  className="bg-green-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Return Asset
                </button>
              )}

              <button
                onClick={() => handleAssetAction(asset.id, "schedule_maintenance", `Preventive maintenance scheduled for ${asset.name}`)}
                disabled={isActionLoading}
                className="bg-orange-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
              >
                <Wrench className="w-4 h-4 inline mr-2" />
                Schedule Maintenance
              </button>

              <button
                onClick={() => handleAssetAction(asset.id, "urgent_maintenance", `Urgent maintenance request submitted for ${asset.name}`)}
                disabled={isActionLoading}
                className="bg-red-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Urgent Repair
              </button>

              <button
                onClick={() => handleAssetAction(asset.id, "request_relocation", `Relocation request submitted for ${asset.name}`)}
                disabled={isActionLoading}
                className="bg-teal-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm"
              >
                <Navigation className="w-4 h-4 inline mr-2" />
                Request Move
              </button>

              <button
                onClick={() => handleAssetAction(asset.id, "report_missing", `${asset.name} reported as missing - Security notified`)}
                disabled={isActionLoading}
                className="bg-gray-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Report Missing
              </button>
            </div>
            
            {/* Quick Action Status Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Quick Status Updates:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${asset.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  Available: {asset.status === 'available' ? 'Yes' : 'No'}
                </span>
                <span className={`px-2 py-1 rounded-full ${asset.utilization > 70 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  High Usage: {asset.utilization > 70 ? 'Yes' : 'No'}
                </span>
                <span className={`px-2 py-1 rounded-full ${new Date(asset.maintenanceDue) < new Date() ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                  Maintenance Due: {new Date(asset.maintenanceDue) < new Date() ? 'Overdue' : 'Current'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border">
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

          <div className="bg-white rounded-2xl p-6 border">
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
