"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, AlertTriangle, MapPin, Clock } from "lucide-react"
import { apiGet } from "@/lib/fetcher"
import toast from "react-hot-toast"

interface AssetProtectionData {
  metrics: {
    totalProtectedAssets: number
    activeGeofences: number
    violationsToday: number
    violationsThisWeek: number
    highValueAssetsAtRisk: number
    averageResponseTime: number
    complianceScore: number
    fullyCompliantAssets: number
    totalMonitoredAssets: number
    alertsGenerated: {
      today: number
      thisWeek: number
      thisMonth: number
    }
  }
}

export default function AssetProtectionCards() {
  const [data, setData] = useState<AssetProtectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isCancelled = false
    
    const fetchData = async () => {
      try {
        const response = await apiGet('/api/asset-protection/dashboard?timeRange=24h')
        if (!isCancelled) {
          setData(response as AssetProtectionData)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load asset protection data:', error)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [])

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'violations':
        if (data?.metrics.violationsToday && data.metrics.violationsToday > 0) {
          toast.error(`${data.metrics.violationsToday} security violations detected today`, {
            duration: 4000,
            icon: '🚨'
          })
        }
        router.push('/asset-protection/movement-logs')
        break
      case 'protected':
        toast.success(`${data?.metrics.totalProtectedAssets || 0} assets are currently protected`, {
          duration: 3000,
          icon: '🛡️'
        })
        router.push('/assets')
        break
      case 'geofences':
        toast.success(`${data?.metrics.activeGeofences || 0} security zones are actively monitoring assets`, {
          duration: 3000,
          icon: '🛡️'
        })
        router.push('/asset-protection/geofencing')
        break
      case 'compliance':
        toast(`Overall compliance score: ${data?.metrics.complianceScore || 0}%`, {
          duration: 3000,
          icon: '📊'
        })
        router.push('/compliance')
        break
      case 'compliant':
        toast.success(`${data?.metrics.fullyCompliantAssets || 0} assets are fully compliant`, {
          duration: 3000,
          icon: '✅'
        })
        router.push('/compliance/reports')
        break
    }
  }

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      {/* Protected Assets */}
      <div 
        className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1"
        onClick={() => handleCardClick('protected')}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
          Protected Assets
        </p>
        <p className="text-xs text-gray-600 mb-4">Total</p>
        <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
          {data?.metrics.totalProtectedAssets ?? 0}
        </p>
        <div className="mt-3 flex items-center text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view details →</span>
        </div>
      </div>

      {/* Security Violations */}
      <div 
        className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1"
        onClick={() => handleCardClick('violations')}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
          Security Violations
        </p>
        <p className="text-xs text-gray-600 mb-4">Today</p>
        <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
          {data?.metrics.violationsToday ?? 0}
        </p>
        <div className="mt-3 flex items-center text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view details →</span>
        </div>
      </div>

      {/* Active Geofences */}
      <div 
        className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1"
        onClick={() => handleCardClick('geofences')}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
          Active Geofences
        </p>
        <p className="text-xs text-gray-600 mb-4">Security Zones</p>
        <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
          {data?.metrics.activeGeofences ?? 0}
        </p>
        <div className="mt-3 flex items-center text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view details →</span>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <div 
        className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1"
        onClick={() => handleCardClick('compliance')}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
          Overall Compliance Score
        </p>
        <p className="text-xs text-gray-600 mb-4">0-100</p>
        <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
          {data?.metrics.complianceScore ?? 0}
        </p>
        <div className="mt-3 flex items-center text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view details →</span>
        </div>
      </div>

      {/* Fully Compliant Assets */}
      <div 
        className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1"
        onClick={() => handleCardClick('compliant')}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
          Fully Compliant
        </p>
        <p className="text-xs text-gray-600 mb-4">No Issues</p>
        <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
          {data?.metrics.fullyCompliantAssets ?? 0}
        </p>
        <div className="mt-3 flex items-center text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view details →</span>
        </div>
      </div>
    </>
  )
}