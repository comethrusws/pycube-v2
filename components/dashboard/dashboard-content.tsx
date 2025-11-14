"use client"

import type React from "react"
import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { apiGet } from "@/lib/fetcher"
import type { DashboardData } from "@/lib/types"
import ComplianceSummaryCard from "./compliance-summary-card"
import AssetsByFloorCard from "./assets-by-floor-card"
import MaintenanceImpactCard from "./maintenance-impact-card"
import AssetProtectionCards from "./asset-protection-cards"
import SubsectionCards from "./subsection-cards"

function DashboardContent() {
  const [data, setData] = useState<DashboardData>()
  const [isLoading, setIsLoading] = useState(true)
  const [range, setRange] = useState<"day" | "week" | "month">("week")
  const router = useRouter()

  useEffect(() => {
    let isCancelled = false
    
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const result = await apiGet<DashboardData>(`/api/core/dashboard?range=${range}`)
        if (!isCancelled) {
          setData(result as any)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch dashboard data:", error)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [range])

  const handleCardClick = useCallback((cardType: string) => {
    switch (cardType) {
      case 'totalAssets':
        router.push('/assets')
        break
      case 'categories':
        router.push('/product-categories')
        break
      case 'facilities':
        router.push('/facilities')
        break
      case 'utilization':
        router.push('/asset-utilization')
        break
      case 'protected':
        router.push('/asset-protection')
        break
      case 'violations':
        router.push('/asset-protection/movement-logs')
        break
      case 'geofences':
        router.push('/asset-protection/geofencing')
        break
      case 'compliance':
        router.push('/compliance')
        break
      case 'compliant':
        router.push('/compliance/reports')
        break
      default:
        break
    }
  }, [router])

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data) return null
    
    return {
      timelineData: (data as any).timeline?.map((item: any) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString()
      })) || [],
      utilizationData: (data as any).utilization || []
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light" style={{ color: "#001f3f" }}>
          Overview
        </h1>
      </div>

      {/* Overview Cards - Top row metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { 
            title: "Total Assets", 
            subtitle: "In System", 
            value: data?.stats.totalAssets ?? "-", 
            type: "totalAssets",
            clickable: true 
          },
          { 
            title: "Asset Categories", 
            subtitle: "Category", 
            value: data?.stats.categories ?? "-", 
            type: "categories",
            clickable: true 
          },
          { 
            title: "Total Facilities", 
            subtitle: "Facility", 
            value: data?.stats.totalFacilities ?? "-", 
            type: "facilities",
            clickable: true 
          },
          { 
            title: "Total Users", 
            subtitle: "Active", 
            value: data?.stats.totalUsers ?? "-", 
            type: "users",
            clickable: false 
          },
          {
            title: "Avg Utilization",
            subtitle: "System Wide",
            value: data?.stats.avgUtilization ? `${data.stats.avgUtilization}%` : "-",
            type: "utilization",
            clickable: true
          },
          {
            title: "Underutilized",
            subtitle: "Assets",
            value: data?.stats.underutilizedAssets ?? "-",
            type: "utilization",
            clickable: true
          },
        ].map((card, i) => (
          <div 
            key={i} 
            className={`bg-white rounded-xl p-4 border border-gray-200 transition-all duration-200 ${
              card.clickable 
                ? 'hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1' 
                : 'hover:shadow-md'
            }`}
            onClick={() => card.clickable && handleCardClick(card.type)}
          >
            <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
              {card.title}
            </p>
            <p className="text-xs text-gray-600 mb-3">{card.subtitle}</p>
            <p className="text-3xl font-normal" style={{ color: "#001f3f" }}>
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </p>
            {card.clickable && (
              <div className="mt-2 flex items-center text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Click to view details →</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overview Cards - Second row metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { 
            title: "Protected Assets", 
            subtitle: "Total", 
            value: data?.dashboardCards?.assetProtection?.protectedAssets ?? "-", 
            type: "protected",
            clickable: true 
          },
          { 
            title: "Security Violations", 
            subtitle: "Today", 
            value: data?.dashboardCards?.assetProtection?.violationsToday ?? "-", 
            type: "violations",
            clickable: true 
          },
          { 
            title: "Active Geofences", 
            subtitle: "Security Zones", 
            value: data?.dashboardCards?.assetProtection?.activeGeofences ?? "-", 
            type: "geofences",
            clickable: true 
          },
          { 
            title: "Overall Compliance Score", 
            subtitle: "0-100", 
            value: data?.dashboardCards?.compliance?.complianceScore ?? "-", 
            type: "compliance",
            clickable: true 
          },
          {
            title: "Fully Compliant",
            subtitle: "No Issues",
            value: data?.dashboardCards?.compliance?.fullyCompliantAssets ?? "-",
            type: "compliant",
            clickable: true
          },
        ].map((card, i) => (
          <div 
            key={i} 
            className={`bg-white rounded-xl p-4 border border-gray-200 transition-all duration-200 ${
              card.clickable 
                ? 'hover:shadow-lg hover:border-teal-300 cursor-pointer transform hover:-translate-y-1' 
                : 'hover:shadow-md'
            }`}
            onClick={() => card.clickable && handleCardClick(card.type)}
          >
            <p className="text-sm font-medium mb-1" style={{ color: "#001f3f" }}>
              {card.title}
            </p>
            <p className="text-xs text-gray-600 mb-3">{card.subtitle}</p>
            <p className="text-3xl font-normal" style={{ color: "#001f3f" }}>
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </p>
            {card.clickable && (
              <div className="mt-2 flex items-center text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Click to view details →</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dashboard Subsection Cards */}
      {data?.dashboardCards && <SubsectionCards data={data.dashboardCards} />}

       {/* <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AssetsByFloorCard />
          <ComplianceSummaryCard />
          <MaintenanceImpactCard />
        </div>
      </div>    
      */}


    </div>
  )
}

export default memo(DashboardContent)
