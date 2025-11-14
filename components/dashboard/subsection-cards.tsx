"use client"

import { useRouter } from "next/navigation"
import { Shield, BarChart3, Wrench, TrendingUp, Building2, Target, AlertTriangle, Clock, CheckCircle, Users, MapPin, Eye, Search, Activity } from "lucide-react"

interface DashboardCardsData {
  assetProtection: {
    protectedAssets: number
    activeGeofences: number 
    violationsToday: number
    avgResponseTime: number
    // Second row cards
    highRiskAssets: number
    complianceScore: number
    alertsThisWeek: number
    falsePositiveRate: number
  }
  assetInsights: {
    assetTagged: number
    assetUntagged: number
    percentTagged: number
    assetsNotFound: number
    assetsInUse: number
    assetsFound: number
    zonesNotScannedCount: number
  }
  compliance: {
    complianceScore: number
    fullyCompliantAssets: number
    totalCompliantAssets: number
    avgRiskScore: number
    // Risk Distribution data
    highRiskAssets: number
    mediumRiskAssets: number
    lowRiskAssets: number
  }
  preventativeMaintenance: {
    totalMonitoredAssets: number
    highRiskAssets: number
    pmTasksCompleted: number
    potentialSavings: number
  }
  assetUtilization: {
    avgUtilization: number
    underutilizedAssets: number
    movementAlerts: number
    idleCriticalAssets: number
    // Location overview data
    totalMonitoredAssets: number
    assetsToLocate: number
    totalAssetsLocated: number
    totalAssetsFlagged: number
  }
  spaceManagement: {
    totalFloors: number
    totalZones: number
    readersOnline: number
    readersOffline: number
    assetsInUse: number
    assetsAvailable: number
  }
}

interface SubsectionCardsProps {
  data: DashboardCardsData
}

const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  onClick,
  trend
}: { 
  title: string
  value: string | number
  subtitle: string
  icon: any
  onClick: () => void
  trend?: string
}) => (
  <div 
    className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-[#0d7a8c] cursor-pointer transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-3">
      <Icon className="w-6 h-6 text-[#0d7a8c]" />
      {trend && (
        <span className="text-xs bg-[#0d7a8c]/10 text-[#0d7a8c] px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-base font-light mb-2 text-[#001f3f] leading-tight">
      {title}
    </p>
    <p className="text-sm text-gray-500 mb-4 font-light">{subtitle}</p>
    <p className="text-4xl font-light text-[#001f3f] leading-none">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
  </div>
)

export default function SubsectionCards({ data }: SubsectionCardsProps) {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Asset Protection Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-light text-[#001f3f]">Asset Protection</h2>
        </div>
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <DashboardCard
            title="Protected Assets"
            value={data.assetProtection.protectedAssets}
            subtitle="Total"
            icon={Shield}
            onClick={() => router.push('/asset-protection')}
          />
          <DashboardCard
            title="Active Geofences"
            value={data.assetProtection.activeGeofences}
            subtitle="Security Zones"
            icon={Target}
            onClick={() => router.push('/asset-protection/geofencing')}
          />
          <DashboardCard
            title="Violations Today"
            value={data.assetProtection.violationsToday}
            subtitle="Security Alerts"
            icon={AlertTriangle}
            onClick={() => router.push('/asset-protection/movement-logs')}
            trend="vs avg"
          />
          <DashboardCard
            title="Avg Response Time"
            value={`${data.assetProtection.avgResponseTime}m`}
            subtitle="To Violations"
            icon={Clock}
            onClick={() => router.push('/asset-protection')}
            trend="15% better"
          />
        </div>
        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="High-Risk Assets"
            value={data.assetProtection.highRiskAssets}
            subtitle="Need Attention"
            icon={AlertTriangle}
            onClick={() => router.push('/asset-protection')}
          />
          <DashboardCard
            title="Compliance Score"
            value={`${data.assetProtection.complianceScore}%`}
            subtitle="Protection Level"
            icon={BarChart3}
            onClick={() => router.push('/compliance')}
            trend="+2%"
          />
          <DashboardCard
            title="Alerts This Week"
            value={data.assetProtection.alertsThisWeek}
            subtitle="Active Issues"
            icon={AlertTriangle}
            onClick={() => router.push('/asset-protection/movement-logs')}
          />
          <DashboardCard
            title="False Positive Rate"
            value={`${data.assetProtection.falsePositiveRate}%`}
            subtitle="System Accuracy"
            icon={CheckCircle}
            onClick={() => router.push('/asset-protection')}
          />
        </div>
      </div>
      
      {/* Asset Utilization Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-light text-[#001f3f]">Asset Utilization</h2>
        </div>
        {/* Utilization Analytics Row */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-md font-light text-[#001f3f]">Utilization</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <DashboardCard
            title="Average Utilization"
            value={`${data.assetUtilization.avgUtilization}%`}
            subtitle="System Wide"
            icon={TrendingUp}
            onClick={() => router.push('/asset-utilization')}
          />
          <DashboardCard
            title="Underutilized Assets"
            value={data.assetUtilization.underutilizedAssets}
            subtitle="< 40% utilization"
            icon={TrendingUp}
            onClick={() => router.push('/asset-utilization')}
          />
          <DashboardCard
            title="Movement Alerts"
            value={data.assetUtilization.movementAlerts}
            subtitle="Last 48 hours"
            icon={MapPin}
            onClick={() => router.push('/asset-utilization')}
          />
          <DashboardCard
            title="Idle Assets (Critical)"
            value={data.assetUtilization.idleCriticalAssets}
            subtitle="> 30 days idle"
            icon={Clock}
            onClick={() => router.push('/asset-utilization')}
          />
        </div>
         <div className="flex items-center gap-2 mb-4">
          <h2 className="text-md font-light text-[#001f3f]">Location</h2>
        </div>
        {/* Location Overview Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Monitored Assets"
            value={data.assetUtilization.totalMonitoredAssets}
            subtitle="Active Tracking"
            icon={Eye}
            onClick={() => router.push('/asset-utilization')}
          />
          <DashboardCard
            title="Assets to be Located"
            value={data.assetUtilization.assetsToLocate}
            subtitle="Pending Location"
            icon={MapPin}
            onClick={() => router.push('/asset-utilization')}
          />
          <DashboardCard
            title="Total Assets Located"
            value={data.assetUtilization.totalAssetsLocated}
            subtitle="Successfully Tracked"
            icon={CheckCircle}
            onClick={() => router.push('/asset-utilization')}
          />
          <DashboardCard
            title="Total Assets Flagged"
            value={data.assetUtilization.totalAssetsFlagged}
            subtitle="Need Attention"
            icon={AlertTriangle}
            onClick={() => router.push('/asset-utilization')}
          />
        </div>
      </div>

      {/* Asset Insights Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-light text-[#001f3f]">Asset Search & Retrieval</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Tagged Widget */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-light uppercase tracking-wide mb-1" style={{ color: "#0d7a8c" }}>
                  Asset Tagged
                </p>
                <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                  {data.assetInsights.assetTagged.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-light uppercase tracking-wide mb-1" style={{ color: "#c41e3a" }}>
                  Untagged
                </p>
                <p className="text-3xl font-light" style={{ color: "#001f3f" }}>
                  {data.assetInsights.assetUntagged.toLocaleString()}
                </p>
              </div>

              <div className="flex justify-center py-6">
                <div className="relative w-96 h-56">
                  {(() => {
                    const pct = data.assetInsights.percentTagged
                    return (
                      <svg viewBox="0 0 100 60" className="w-full h-full">
                        {/* Background arc */}
                        <path 
                          d="M10,50 A40,40 0 0 1 90,50" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="8" 
                          strokeLinecap="round"
                        />
                        {/* Progress arc */}
                        <path 
                          d="M10,50 A40,40 0 0 1 90,50" 
                          fill="none" 
                          stroke="#0d7a8c" 
                          strokeWidth="8" 
                          strokeLinecap="round"
                          pathLength="100"
                          strokeDasharray="100"
                          strokeDashoffset={100 - pct}
                          style={{
                            transition: 'stroke-dashoffset 0.5s ease-in-out'
                          }}
                        />
                      </svg>
                    )
                  })()}
                  <div className="absolute left-0 right-0 top-24 flex flex-col items-center justify-center">
                    <p className="text-4xl font-light" style={{ color: "#001f3f" }}>
                      {data.assetInsights.percentTagged}%
                    </p>
                    <p className="text-base text-gray-600">Asset Tagged</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center">Asset tagging summary</p>
            </div>
          </div>

          {/* Assets Overview Widget */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-sm font-light uppercase tracking-wide mb-6" style={{ color: "#001f3f" }}>
              Assets Overview
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[{
                  label: "Assets Not Found",
                  value: data.assetInsights.assetsNotFound,
                  accent: "#fee2e2",
                  border: "#fecaca",
                  text: "#c41e3a",
                }, {
                  label: "Assets In Use",
                  value: data.assetInsights.assetsInUse,
                  accent: "#e0f2f1",
                  border: "#b2dfdb",
                  text: "#0d7a8c",
                }, {
                  label: "Assets Found",
                  value: data.assetInsights.assetsFound,
                  accent: "#eef2ff",
                  border: "#c7d2fe",
                  text: "#1e3a8a",
                }].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: item.accent, border: `1px solid ${item.border}` }}>
                    <p className="text-xs font-light mb-1" style={{ color: item.text }}>{item.label}</p>
                    <p className="text-3xl font-light" style={{ color: "#001f3f" }}>{item.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zones Not Scanned Widget */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-sm font-light uppercase tracking-wide mb-6" style={{ color: "#001f3f" }}>
              Zones Not Scanned
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light" style={{ color: "#0d7a8c" }}>
                  Today
                </span>
                <span className="text-xs text-gray-600">Status</span>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {[
                  "ICU", "Emergency", "Radiology", "Surgery", "Orthopedics", "Pharmacy", "Neurology"
                ].slice(0, 6).map((zone, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-light" style={{ color: "#001f3f" }}>
                      {zone}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                      Unscanned
                    </span>
                  </div>
                ))}
              </div>
              {data.assetInsights.zonesNotScannedCount > 6 && (
                <button
                  className="w-full text-center text-sm transition-opacity hover:opacity-80 py-2"
                  style={{ color: "#0d7a8c" }}
                >
                  +{data.assetInsights.zonesNotScannedCount - 6} more
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance & Risk Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-light text-[#001f3f]">Compliance & Risk</h2>
        </div>
        {/* First Row - Main Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <DashboardCard
            title="Overall Compliance Score"
            value={`${data.compliance.complianceScore}`}
            subtitle="0-100"
            icon={BarChart3}
            onClick={() => router.push('/compliance')}
          />
          <DashboardCard
            title="Total Assets"
            value={data.compliance.totalCompliantAssets}
            subtitle="Monitored"
            icon={Eye}
            onClick={() => router.push('/assets')}
          />
          <DashboardCard
            title="Fully Compliant"
            value={data.compliance.fullyCompliantAssets}
            subtitle="No Issues"
            icon={CheckCircle}
            onClick={() => router.push('/compliance/reports')}
          />
          <DashboardCard
            title="Average Risk Score"
            value={data.compliance.avgRiskScore}
            subtitle="All assets"
            icon={AlertTriangle}
            onClick={() => router.push('/compliance')}
          />
        </div>
        {/* Second Row - Risk Distribution */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-md font-light text-[#001f3f]">Risk Distribution (Non-compliant Assets)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title="High Risk Assets"
            value={data.compliance.highRiskAssets}
            subtitle="Critical Issues"
            icon={AlertTriangle}
            onClick={() => router.push('/compliance')}
          />
          <DashboardCard
            title="Medium Risk Assets"
            value={data.compliance.mediumRiskAssets}
            subtitle="Moderate Issues"
            icon={AlertTriangle}
            onClick={() => router.push('/compliance')}
          />
          <DashboardCard
            title="Low Risk Assets"
            value={data.compliance.lowRiskAssets}
            subtitle="Minor Issues"
            icon={CheckCircle}
            onClick={() => router.push('/compliance')}
          />
        </div>
      </div>

      {/* Preventative Maintenance Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-light text-[#001f3f]">Preventative Maintenance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Monitored Assets"
            value={data.preventativeMaintenance.totalMonitoredAssets}
            subtitle="Under PM Program"
            icon={Eye}
            onClick={() => router.push('/preventative-maintenance')}
          />
          <DashboardCard
            title="High Risk Assets"
            value={data.preventativeMaintenance.highRiskAssets}
            subtitle="Need Attention"
            icon={AlertTriangle}
            onClick={() => router.push('/preventative-maintenance')}
          />
          <DashboardCard
            title="PM Tasks Completed"
            value={data.preventativeMaintenance.pmTasksCompleted}
            subtitle="This Period"
            icon={CheckCircle}
            onClick={() => router.push('/preventative-maintenance/requests')}
          />
          <DashboardCard
            title="Potential Savings"
            value={`$${(data.preventativeMaintenance.potentialSavings).toLocaleString()}`}
            subtitle="Cost Avoidance"
            icon={TrendingUp}
            onClick={() => router.push('/preventative-maintenance')}
          />
        </div>
      </div>


      {/* Space Management Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-light text-[#001f3f]">Space Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Floors"
            value={data.spaceManagement.totalFloors}
            subtitle="Total"
            icon={Building2}
            onClick={() => router.push('/space-management/floors')}
          />
          <DashboardCard
            title="Zones"
            value={data.spaceManagement.totalZones}
            subtitle="Total"
            icon={MapPin}
            onClick={() => router.push('/space-management/zones')}
          />
          <DashboardCard
            title="Readers Online"
            value={data.spaceManagement.readersOnline}
            subtitle="Active"
            icon={CheckCircle}
            onClick={() => router.push('/space-management/readers')}
          />
          <DashboardCard
            title="Readers Offline"
            value={data.spaceManagement.readersOffline}
            subtitle="Inactive"
            icon={AlertTriangle}
            onClick={() => router.push('/space-management/readers')}
          />
          <DashboardCard
            title="Assets In Use"
            value={data.spaceManagement.assetsInUse}
            subtitle="Currently Active"
            icon={Users}
            onClick={() => router.push('/assets')}
          />
          <DashboardCard
            title="Assets Available"
            value={data.spaceManagement.assetsAvailable}
            subtitle="Ready for Use"
            icon={CheckCircle}
            onClick={() => router.push('/assets')}
          />
        </div>
      </div>
    </div>
  )
}