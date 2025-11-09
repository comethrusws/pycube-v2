import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiGet } from '@/lib/fetcher'

interface AnalyticsData {
  totalAssets: number
  totalProducts: number
  utilizationRate: number
  maintenanceCount: number
  highRiskAssets: number
  assetsByStatus: Record<string, number>
  assetsByType: Record<string, number>
  departmentBreakdown: Record<string, number>
  recentActivity: any[]
}

interface UseAnalyticsOptions {
  refreshInterval?: number
  autoRefresh?: boolean
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { refreshInterval = 30000, autoRefresh = false } = options
  
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiGet<AnalyticsData>('/api/analytics/dashboard')
      
      setData(response)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Initial fetch
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchAnalytics, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAnalytics])

  // Memoized derived data
  const insights = useMemo(() => {
    if (!data) return null

    const criticalAssets = data.highRiskAssets
    const healthScore = Math.round(
      ((data.totalAssets - data.maintenanceCount - criticalAssets) / data.totalAssets) * 100
    )
    
    const topDepartment = Object.entries(data.departmentBreakdown)
      .reduce((max, [dept, count]) => count > max.count ? { dept, count } : max, { dept: '', count: 0 })
    
    const mostCommonType = Object.entries(data.assetsByType)
      .reduce((max, [type, count]) => count > max.count ? { type, count } : max, { type: '', count: 0 })

    return {
      criticalAssets,
      healthScore,
      topDepartment: topDepartment.dept,
      mostCommonType: mostCommonType.type,
      utilizationTrend: data.utilizationRate > 75 ? 'high' : data.utilizationRate > 50 ? 'medium' : 'low'
    }
  }, [data])

  const summary = useMemo(() => {
    if (!data) return null

    return {
      totalAssets: data.totalAssets,
      activeAssets: data.assetsByStatus?.available || 0,
      utilizationRate: `${data.utilizationRate}%`,
      maintenanceNeeded: data.maintenanceCount,
      lastUpdate: lastUpdated?.toLocaleTimeString() || 'Never'
    }
  }, [data, lastUpdated])

  return {
    data,
    loading,
    error,
    insights,
    summary,
    refresh,
    lastUpdated
  }
}

// Specialized hook for real-time metrics
export function useRealtimeMetrics() {
  return useAnalytics({ 
    refreshInterval: 10000, 
    autoRefresh: true 
  })
}

// Hook for static dashboard data (less frequent updates)
export function useDashboardAnalytics() {
  return useAnalytics({ 
    refreshInterval: 60000, 
    autoRefresh: true 
  })
}