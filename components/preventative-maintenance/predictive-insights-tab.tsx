"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { AlertTriangle, Calendar, Download, ExternalLink, TrendingUp, Zap, Clock, Settings, CheckCircle, X } from "lucide-react"
import { apiGet } from "@/lib/fetcher"

// Minimalist Modal Component (Jony Ive inspired)
const Modal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        <div className="flex items-center justify-between p-8 border-b border-gray-100/50">
          <h2 className="text-xl font-light tracking-tight" style={{ color: "#001f3f" }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100/50 hover:bg-gray-200/50 flex items-center justify-center transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Schedule Maintenance Modal
const ScheduleMaintenanceModal = ({ asset, onClose }: { asset: any, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    type: "preventive",
    urgency: "medium", 
    scheduledDate: "",
    estimatedDuration: "2",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Schedule Maintenance</h4>
            <p className="text-sm text-blue-700">
              <strong>{asset.assetName}</strong> requires attention within {asset.predictedFailureWindow} days
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Maintenance Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="emergency">Emergency</option>
            <option value="calibration">Calibration</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Priority</label>
          <select
            value={formData.urgency}
            onChange={(e) => setFormData({...formData, urgency: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Scheduled Date</label>
          <input
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Estimated Duration (hours)</label>
          <input
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})}
            min="0.5"
            step="0.5"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          placeholder="Any specific instructions or observations..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {isSubmitting ? 'Scheduling...' : 'Schedule Maintenance'}
        </button>
      </div>
    </form>
  )
}

// Minimalist Stat Card
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  color = "#0d7a8c", 
  icon: Icon,
  trend 
}: { 
  title: string
  value: string | number
  subtitle?: string
  color?: string
  icon?: React.ComponentType<any>
  trend?: string
}) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-500 border border-gray-100/50">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1 tracking-wide">{title}</p>
        <p className="text-3xl font-light tracking-tight" style={{ color }}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      )}
    </div>
    {trend && (
      <p className="text-xs text-gray-500 border-t border-gray-100/50 pt-3">{trend}</p>
    )}
  </div>
)

// Chart Card with minimalist design
const ChartCard = ({ title, children, action }: { 
  title: string
  children: React.ReactNode
  action?: React.ReactNode 
}) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 border border-gray-100/50 overflow-hidden">
    <div className="flex items-center justify-between p-8 pb-4">
      <h3 className="text-lg font-light tracking-tight" style={{ color: "#001f3f" }}>
        {title}
      </h3>
      {action}
    </div>
    <div className="px-8 pb-8">
      {children}
    </div>
  </div>
)

export default function PredictiveInsightsTab() {
  const [data, setData] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [scheduleModalAsset, setScheduleModalAsset] = useState<any>(null)

  useEffect(() => {
    apiGet("/api/preventative-maintenance/predictive")
      .then((d) => {
        setData(d)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load predictive maintenance data:", error)
        setIsLoading(false)
      })
  }, [])

  const handleExport = () => {
    // Simulate CSV export
    const csvData = data?.top5AtRisk?.map((asset: any) => [
      asset.assetName,
      asset.location,
      asset.predictedIssue,
      `${asset.confidenceScore}%`,
      asset.recommendedAction
    ]) || []
    
    console.log("Exporting predictive insights data:", csvData)
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200/50 rounded-2xl w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200/50 rounded-3xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200/50 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light tracking-tight" style={{ color: "#001f3f" }}>
          Predictive Maintenance Insights
        </h1>
        <p className="text-gray-500 font-light">AI-driven equipment failure predictions and proactive maintenance recommendations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assets Monitored"
          value={data?.summary?.totalAssetsMonitored || 0}
          subtitle="AI prediction enabled"
          icon={Zap}
        />
        <StatCard
          title="High Risk Assets"
          value={data?.summary?.highRiskAssets || 0}
          subtitle="Requires immediate attention"
          color="#dc2626"
          icon={AlertTriangle}
        />
        <StatCard
          title="Avg Confidence"
          value={`${data?.summary?.avgConfidenceScore || 0}%`}
          subtitle="Prediction accuracy"
          color="#059669"
          icon={TrendingUp}
        />
        <StatCard
          title="Cost Savings"
          value={`$${(data?.summary?.potentialCostSavings || 0).toLocaleString()}`}
          subtitle="Prevented failures"
          color="#7c3aed"
          icon={CheckCircle}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prediction Summary Bar Chart */}
        <ChartCard 
          title="Failure Prediction Timeline"
          action={
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          }
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.top5AtRisk || []} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="assetName" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="none"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Days Until Failure', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value, name, props) => [
                    `${value} days`,
                    `Confidence: ${props.payload.confidenceScore}%`
                  ]}
                />
                <Bar 
                  dataKey="predictedFailureWindow" 
                  fill="#0d7a8c"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => setSelectedAsset(data)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Risk Distribution */}
        <ChartCard title="Risk Distribution Overview">
          <div className="flex items-center justify-center">
            <div className="w-80 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.riskDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {(data?.riskDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value, name, props) => [
                      `${value} assets (${props.payload.value}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-8 space-y-4">
              {(data?.riskDistribution || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.count} assets</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Top 5 At-Risk Assets Table */}
      <ChartCard title="Critical Assets Requiring Attention">
        <div className="overflow-hidden rounded-2xl border border-gray-100/50">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Asset</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Location</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Predicted Issue</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Confidence</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.top5AtRisk || []).map((asset: any, idx: number) => (
                <tr key={idx} className="border-t border-gray-100/50 hover:bg-gray-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        asset.riskLevel === 'high' ? 'bg-red-500' :
                        asset.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{asset.assetName}</p>
                        <p className="text-xs text-gray-500">{asset.assetType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">{asset.location}</td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm text-gray-900">{asset.predictedIssue}</p>
                      <p className="text-xs text-gray-500">{asset.predictedFailureWindow} days remaining</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            asset.confidenceScore > 80 ? 'bg-green-500' :
                            asset.confidenceScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${asset.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{asset.confidenceScore}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setScheduleModalAsset(asset)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Degradation Trends */}
      {data?.degradationTrends?.length > 0 && (
        <ChartCard title="Asset Degradation Trends">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Degradation Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                {data.degradationTrends.map((asset: any, idx: number) => (
                  <Line 
                    key={idx}
                    type="monotone" 
                    dataKey="degradationScore"
                    data={asset.trend}
                    stroke={idx === 0 ? "#dc2626" : idx === 1 ? "#ea580c" : "#0d7a8c"}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name={asset.assetName}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Modals */}
      <Modal
        isOpen={!!scheduleModalAsset}
        onClose={() => setScheduleModalAsset(null)}
        title="Schedule Maintenance"
      >
        {scheduleModalAsset && (
          <ScheduleMaintenanceModal
            asset={scheduleModalAsset}
            onClose={() => setScheduleModalAsset(null)}
          />
        )}
      </Modal>
    </div>
  )
}
