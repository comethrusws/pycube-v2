"use client"

import { useRouter } from "next/navigation"
import { Shield, BarChart3, Wrench, TrendingUp, Building2, Target, AlertTriangle, Clock, CheckCircle, Users, MapPin, Eye } from "lucide-react"

interface DashboardCardsData {
  assetProtection: {
    protectedAssets: number
    activeGeofences: number 
    violationsToday: number
    avgResponseTime: number
  }
  compliance: {
    complianceScore: number
    fullyCompliantAssets: number
    totalCompliantAssets: number
    avgRiskScore: number
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
    <p className="text-sm font-medium mb-1 text-[#001f3f]">
      {title}
    </p>
    <p className="text-xs text-gray-600 mb-4">{subtitle}</p>
    <p className="text-3xl font-light text-[#001f3f]">
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
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-md font-light text-[#001f3f]">Asset Protection</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Compliance & Risk Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-md font-light text-[#001f3f]">Compliance & Risk</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Preventative Maintenance Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-md font-light text-[#001f3f]">Preventative Maintenance</h2>
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

      {/* Asset Utilization Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-md font-light text-[#001f3f]">Asset Utilization</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Space Management Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-md font-light text-[#001f3f]">Space Management</h2>
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