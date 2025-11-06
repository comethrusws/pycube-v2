"use client"

import { useState, useEffect } from "react"
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  TrendingUp, 
  Eye, 
  Clock, 
  Users, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  Bell,
  Settings,
  Download,
  ZapOff,
  Target,
  Zap
} from "lucide-react"
import { apiGet } from "@/lib/fetcher"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"

interface AssetProtectionDashboardData {
  metrics: {
    totalProtectedAssets: number
    activeGeofences: number
    violationsToday: number
    violationsThisWeek: number
    violationsThisMonth: number
    highValueAssetsAtRisk: number
    averageResponseTime: number
    falsePositiveRate: number
    alertsGenerated: {
      today: number
      thisWeek: number
      thisMonth: number
    }
    complianceScore: number
    topViolationTypes: Array<{
      type: string
      count: number
      percentage: number
    }>
    violationTrend: Array<{
      date: string
      violations: number
      resolved: number
    }>
    geofenceEffectiveness: Array<{
      zoneId: string
      zoneName: string
      violationCount: number
      responseRate: number
      averageResponseTime: number
    }>
  }
  recentViolations: Array<{
    id: string
    geofenceZoneName: string
    assetName: string
    assetType: string
    violationType: string
    severity: string
    timestamp: string
    status: string
    estimatedRisk: number
  }>
  activeAlerts: Array<{
    id: string
    type: string
    assetName: string
    message: string
    severity: string
    status: string
    createdAt: string
    urgency: string
    actionRequired: boolean
  }>
  riskAssets: Array<{
    assetId: string
    assetName: string
    assetType: string
    value: number
    riskScore: number
    location: string
    violationCount: number
  }>
  protectionCoverage: Array<{
    departmentId: string
    departmentName: string
    totalAssets: number
    protectedAssets: number
    coverage: number
    violations: number
  }>
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendValue, 
  color = "blue",
  onClick 
}: {
  icon: any
  label: string
  value: string | number
  trend?: "up" | "down" | "neutral"
  trendValue?: string | number
  color?: string
  onClick?: () => void
}) => {
  const colorClasses = {
    blue: "bg-[#001f3f]/5 border-[#001f3f]/10 backdrop-blur-sm",
    green: "bg-[#0d7a8c]/5 border-[#0d7a8c]/10 backdrop-blur-sm",
    yellow: "bg-yellow-500/5 border-yellow-500/10 backdrop-blur-sm",
    red: "bg-red-500/5 border-red-500/10 backdrop-blur-sm",
    purple: "bg-purple-500/5 border-purple-500/10 backdrop-blur-sm",
    gray: "bg-gray-500/5 border-gray-500/10 backdrop-blur-sm"
  }
  
  const iconColorClasses = {
    blue: "text-[#001f3f]",
    green: "text-[#0d7a8c]", 
    yellow: "text-yellow-600",
    red: "text-red-600",
    purple: "text-purple-600",
    gray: "text-gray-600"
  }
  
  return (
    <div 
      className={`p-6 rounded-3xl border ${colorClasses[color as keyof typeof colorClasses]} ${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''} bg-white/50`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
          <div>
            <p className="text-sm font-light text-gray-600">{label}</p>
            <p className="text-2xl font-semibold text-[#001f3f]">{value}</p>
            {trend && trendValue && (
              <p className={`text-xs font-light ${
                trend === 'up' ? 'text-[#0d7a8c]' : 
                trend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ChartCard = ({ title, children, action }: { title: string, children: React.ReactNode, action?: React.ReactNode }) => (
  <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-[#001f3f]/10 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-light text-[#001f3f]">{title}</h3>
      {action}
    </div>
    {children}
  </div>
)

export default function AssetProtectionDashboard() {
  const [data, setData] = useState<AssetProtectionDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setRefreshing(true)
      const response = await apiGet(`/api/asset-protection/dashboard?timeRange=${selectedTimeRange}`)
      setData(response as AssetProtectionDashboardData)
    } catch (error) {
      console.error('Failed to load asset protection data:', error)
      toast.error('Failed to load asset protection dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedTimeRange])

  const handleAlertClick = (alert: any) => {
    toast.success(`Alert acknowledged: ${alert.message}`, {
      duration: 4000,
      icon: '🔔'
    })
  }

  const handleViolationClick = (violation: any) => {
    toast.error(`Security violation: ${violation.assetName} in ${violation.geofenceZoneName}`, {
      duration: 5000,
      icon: '🚨'
    })
  }

  const handleGeofenceAlert = () => {
    toast.error('CRITICAL: High-value asset detected outside authorized zone!', {
      duration: 8000,
      icon: '🚨',
      style: {
        background: '#FEE2E2',
        border: '1px solid #FECACA',
        color: '#991B1B'
      }
    })
  }

  const handleEmergencyResponse = () => {
    toast.success('Emergency response team notified. ETA: 3 minutes', {
      duration: 6000,
      icon: '🚑'
    })
  }

  const simulateRealTimeAlert = () => {
    const alerts = [
      'MRI Machine #7 moved to unauthorized zone - ICU Floor 3',
      'Surgical Robot detected outside operating theater',
      'High-value ventilator moved after hours - Emergency response required',
      'CT Scanner #2 geofence violation - Security investigating',
      'Infusion pump cluster moved without authorization'
    ]
    
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)]
    toast.error(randomAlert, {
      duration: 10000,
      icon: '🚨',
      style: {
        background: '#FEE2E2',
        border: '1px solid #FECACA',
        color: '#991B1B',
        fontWeight: 'bold'
      }
    })
  }

  // Simulate real-time alerts every 15-30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every interval
        simulateRealTimeAlert()
      }
    }, Math.random() * 15000 + 15000) // 15-30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-8 bg-[#f8fafc] min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#001f3f]/10 rounded-2xl w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-[#001f3f]/10"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-[#f8fafc] min-h-screen">
      <Toaster />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-[#001f3f] flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#0d7a8c]" />
            Asset Protection Dashboard
          </h1>
          <p className="text-gray-600 mt-2 font-light">
            Monitor asset security, geofencing violations, and movement anomalies
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-[#001f3f]/20 rounded-2xl focus:ring-2 focus:ring-[#0d7a8c] bg-white/50 backdrop-blur-sm text-[#001f3f]"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <button
            onClick={loadData}
            disabled={refreshing}
            className="px-4 py-2 bg-[#0d7a8c] text-white rounded-2xl hover:bg-[#003d5c] disabled:opacity-50 flex items-center gap-2 transition-colors duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleGeofenceAlert}
            className="px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600 flex items-center gap-2 transition-colors duration-200"
          >
            <AlertTriangle className="w-4 h-4" />
            Test Alert
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Shield}
          label="Protected Assets"
          value={data?.metrics.totalProtectedAssets || 0}
          color="blue"
          onClick={() => toast(`${data?.metrics.totalProtectedAssets} assets under protection`, { 
            icon: 'ℹ️',
            duration: 3000 
          })}
        />
        <StatCard
          icon={Target}
          label="Active Geofences"
          value={data?.metrics.activeGeofences || 0}
          color="green"
          onClick={() => toast(`${data?.metrics.activeGeofences} geofence zones active`, { 
            icon: 'ℹ️',
            duration: 3000 
          })}
        />
        <StatCard
          icon={AlertTriangle}
          label="Violations Today"
          value={data?.metrics.violationsToday || 0}
          trend={(data?.metrics.violationsToday || 0) > ((data?.metrics.violationsThisWeek || 0) / 7) ? "up" : "down"}
          trendValue="vs avg"
          color="red"
          onClick={() => handleViolationClick({ assetName: 'Multiple assets', geofenceZoneName: 'Various zones' })}
        />
        <StatCard
          icon={Clock}
          label="Avg Response Time"
          value={`${data?.metrics.averageResponseTime || 0}m`}
          trend="down"
          trendValue="15% better"
          color="purple"
          onClick={() => toast.success('Response time improved by 15% this week')}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={AlertCircle}
          label="High-Risk Assets"
          value={data?.metrics.highValueAssetsAtRisk || 0}
          color="yellow"
          onClick={() => toast(`${data?.metrics.highValueAssetsAtRisk} high-value assets need attention`, { 
            icon: '⚠️',
            duration: 4000,
            style: {
              background: '#FEF3C7',
              color: '#92400E'
            }
          })}
        />
        <StatCard
          icon={TrendingUp}
          label="Compliance Score"
          value={`${data?.metrics.complianceScore || 0}%`}
          trend="up"
          trendValue="+2%"
          color="green"
        />
        <StatCard
          icon={Bell}
          label="Alerts This Week"
          value={data?.metrics.alertsGenerated.thisWeek || 0}
          color="blue"
          onClick={() => toast(`${data?.metrics.alertsGenerated.thisWeek} alerts generated this week`, { 
            icon: 'ℹ️',
            duration: 3000 
          })}
        />
        <StatCard
          icon={ZapOff}
          label="False Positive Rate"
          value={`${data?.metrics.falsePositiveRate || 0}%`}
          color="gray"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Violations */}
        <ChartCard 
          title="Recent Security Violations"
          action={
            <Link href="/asset-protection/geofencing" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {data?.recentViolations?.slice(0, 6).map((violation, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border cursor-pointer hover:shadow-md transition-all duration-200 backdrop-blur-sm ${
                  violation.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                  violation.severity === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
                  violation.severity === 'medium' ? 'bg-yellow-500/5 border-yellow-500/20' :
                  'bg-[#0d7a8c]/5 border-[#0d7a8c]/20'
                }`}
                onClick={() => handleViolationClick(violation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-[#001f3f] text-sm">{violation.assetName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        violation.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        violation.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {violation.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{violation.geofenceZoneName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {violation.violationType} • Risk: {violation.estimatedRisk}/10
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">
                      {new Date(violation.timestamp).toLocaleTimeString()}
                    </p>
                    {violation.status === 'resolved' ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {(!data?.recentViolations || data.recentViolations.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="font-medium">No recent violations</p>
                <p className="text-sm">Your assets are secure</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Active Alerts */}
        <ChartCard 
          title="Active Security Alerts"
          action={
            <button
              onClick={handleEmergencyResponse}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-2xl hover:bg-red-600 transition-colors duration-200"
            >
              Emergency Response
            </button>
          }
        >
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {data?.activeAlerts?.slice(0, 6).map((alert, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border cursor-pointer hover:shadow-md transition-all duration-200 backdrop-blur-sm ${
                  alert.urgency === 'immediate' ? 'bg-red-500/5 border-red-500/20' :
                  alert.urgency === 'within_hour' ? 'bg-orange-500/5 border-orange-500/20' :
                  alert.urgency === 'within_day' ? 'bg-yellow-500/5 border-yellow-500/20' :
                  'bg-[#0d7a8c]/5 border-[#0d7a8c]/20'
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-[#001f3f] text-sm">{alert.assetName}</h4>
                      {alert.actionRequired && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#001f3f]/80 mb-1 font-light">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {alert.type.replace(/_/g, ' ')} • {alert.urgency.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>
                    <span className={`inline-block w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></span>
                  </div>
                </div>
              </div>
            ))}
            
            {(!data?.activeAlerts || data.activeAlerts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="font-medium">No active alerts</p>
                <p className="text-sm">All systems normal</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Risk Assets and Protection Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* High-Risk Assets */}
        <ChartCard 
          title="High-Risk Assets"
          action={
            <Link href="/assets" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
              Manage Assets <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data?.riskAssets?.slice(0, 8).map((asset, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#001f3f]/10 hover:bg-white/70 transition-all duration-200 cursor-pointer">
                <div className="flex-1">
                  <h4 className="font-medium text-[#001f3f] text-sm">{asset.assetName}</h4>
                  <p className="text-xs text-gray-600">{asset.assetType} • {asset.location}</p>
                  <p className="text-xs text-gray-500">Value: ${asset.value.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    asset.riskScore >= 80 ? 'bg-red-100 text-red-800' :
                    asset.riskScore >= 60 ? 'bg-orange-100 text-orange-800' :
                    asset.riskScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {asset.riskScore}
                  </div>
                  {asset.violationCount > 0 && (
                    <p className="text-xs text-red-600 mt-1">{asset.violationCount} violations</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Protection Coverage by Department */}
        <ChartCard title="Protection Coverage by Department">
          <div className="space-y-4">
            {data?.protectionCoverage?.slice(0, 6).map((dept, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#001f3f]">{dept.departmentName}</span>
                  <span className="text-sm text-gray-500">{dept.coverage}%</span>
                </div>
                <div className="w-full bg-[#001f3f]/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dept.coverage >= 90 ? 'bg-[#0d7a8c]' :
                      dept.coverage >= 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${dept.coverage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{dept.protectedAssets}/{dept.totalAssets} assets protected</span>
                  {dept.violations > 0 && (
                    <span className="text-red-600">{dept.violations} violations</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#001f3f]/5 to-[#003d5c]/5 rounded-3xl p-6 border border-[#001f3f]/10 backdrop-blur-sm">
        <h3 className="text-lg font-light text-[#001f3f] mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#0d7a8c]" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/asset-protection/geofencing"
            className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#001f3f]/10 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-[#0d7a8c] group-hover:text-[#003d5c]" />
              <div>
                <h4 className="font-medium text-[#001f3f]">Manage Geofences</h4>
                <p className="text-sm text-gray-600 font-light">Configure virtual boundaries</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/asset-protection/movement-logs"
            className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#001f3f]/10 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-[#0d7a8c] group-hover:text-[#003d5c]" />
              <div>
                <h4 className="font-medium text-[#001f3f]">Movement Logs</h4>
                <p className="text-sm text-gray-600 font-light">View asset movement history</p>
              </div>
            </div>
          </Link>
          
          <button
            onClick={() => toast.success('Downloading protection report...', { icon: '📊' })}
            className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#001f3f]/10 hover:shadow-md transition-all duration-200 group text-left"
          >
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-[#0d7a8c] group-hover:text-[#003d5c]" />
              <div>
                <h4 className="font-medium text-[#001f3f]">Export Report</h4>
                <p className="text-sm text-gray-600 font-light">Download security analytics</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}