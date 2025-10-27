"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, MessageCircle, Zap, BrainCog, RefreshCw, Trash2 } from "lucide-react"
import { apiGet } from "@/lib/fetcher"
import AILayout from "@/components/dashboard/ai-layout"

const suggestedPrompts = [
  "Which assets are underutilized today?",
  "Recommend asset reallocations across departments",
  "Show equipment that can be transferred to ICU",
  "List assets nearing maintenance schedules",
  "Find idle assets over 30 days",
  "Analyze utilization trends this month",
  "Show predictive maintenance insights",
  "What equipment needs immediate attention?",
  "Compare department performance",
  "Identify cost-saving opportunities"
]

interface AssetData {
  assets: any[]
  maintenanceTasks: any[]
  departments: any[]
  zones: any[]
  assetLocatorData: any
  predictiveMaintenanceData: any
}

interface ApiResponse {
  assets?: any[]
  tasks?: any[]
  departments?: any[]
  zones?: any[]
  [key: string]: any
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; timestamp: Date }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [assetData, setAssetData] = useState<AssetData | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: "Welcome to the AI Assistant! I'm here to help you with comprehensive asset management insights. I can analyze utilization patterns, predict maintenance needs, recommend optimizations, and provide detailed reports about your equipment and operations.\n\nWhat would you like to know about your assets today?",
      timestamp: new Date()
    }])
  }, [])

  // Load asset data when component mounts
  useEffect(() => {
    const loadAssetData = async () => {
      try {
        setIsDataLoading(true)
        const [assetsResponse, maintenanceResponse, assetLocatorResponse, predictiveResponse] = await Promise.all([
          apiGet("/api/assets") as Promise<ApiResponse>,
          apiGet("/api/preventative-maintenance/tasks") as Promise<ApiResponse>,
          apiGet("/api/asset-locator/dashboard"),
          apiGet("/api/preventative-maintenance/predictive")
        ])

        setAssetData({
          assets: assetsResponse?.assets || [],
          maintenanceTasks: maintenanceResponse?.tasks || [],
          departments: assetsResponse?.departments || [],
          zones: assetsResponse?.zones || [],
          assetLocatorData: assetLocatorResponse || {},
          predictiveMaintenanceData: predictiveResponse || {}
        })
      } catch (error) {
        console.error("Failed to load asset data for AI assistant:", error)
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I'm having trouble loading some data. I can still help with general questions, but my responses might be limited until the data loads successfully.",
          timestamp: new Date()
        }])
      } finally {
        setIsDataLoading(false)
      }
    }

    loadAssetData()
  }, [])

  const analyzeQuery = (query: string): string => {
    if (!assetData) {
      return "I'm still loading asset data. Please wait a moment and try again."
    }

    const lowerQuery = query.toLowerCase()
    
    // Underutilized assets analysis
    if (lowerQuery.includes("underutilized") || lowerQuery.includes("under utilized") || lowerQuery.includes("low utilization")) {
      const underutilizedAssets = assetData.assets.filter(asset => asset.utilization < 40)
      const count = underutilizedAssets.length
      
      if (count === 0) {
        return "🎉 Excellent news! All assets are currently well-utilized with utilization rates above 40%. Your asset management is performing exceptionally well.\n\n📊 Current Performance:\n• All assets above 40% utilization\n• No immediate optimization needed\n• Strong operational efficiency\n\nRecommendation: Continue monitoring and maintain current management practices."
      }

      const examples = underutilizedAssets.slice(0, 5).map(asset => {
        const zone = assetData.zones.find(z => z.id === asset.location?.zoneId)
        return `• ${asset.name} (${asset.type}) - ${asset.utilization}% utilization in ${zone?.name || 'Unknown location'}`
      }).join('\n')

      return `⚠️ Found ${count} underutilized assets (below 40% utilization):\n\n${examples}${count > 5 ? `\n\n...and ${count - 5} more assets` : ''}\n\n💡 Recommendations:\n• Consider redistributing these assets to high-demand areas\n• Schedule utilization reviews with department heads\n• Evaluate maintenance requirements\n• Analyze usage patterns for optimization opportunities`
    }

    // Asset reallocation recommendations
    if (lowerQuery.includes("reallocation") || lowerQuery.includes("redistribution") || lowerQuery.includes("transfer") || lowerQuery.includes("move")) {
      const redistributionSuggestions = assetData.assetLocatorData?.utilization?.redistributionSuggestions || []
      
      if (redistributionSuggestions.length === 0) {
        return "✅ Current asset distribution appears optimal! No immediate redistribution recommendations at this time.\n\n📊 Distribution Status:\n• Assets are well-balanced across departments\n• Utilization rates are satisfactory\n• No significant optimization opportunities detected\n\nRecommendation: Continue monitoring for future optimization opportunities."
      }

      const suggestions = redistributionSuggestions.slice(0, 3).map((suggestion: any) => 
        `• Move ${suggestion.assetName} from ${suggestion.fromDepartment} to ${suggestion.toDepartment}\n  Expected impact: ${suggestion.potentialImpact}\n  Estimated savings: $${suggestion.estimatedSavings}`
      ).join('\n\n')

      return `🔄 Asset Redistribution Recommendations:\n\n${suggestions}\n\n💰 Total Potential Savings: $${redistributionSuggestions.reduce((sum: number, s: any) => sum + s.estimatedSavings, 0)}\n\n📋 Next Steps:\n• Coordinate with department heads\n• Schedule transfer logistics\n• Monitor post-transfer performance\n• Document efficiency improvements`
    }

    // ICU equipment transfer
    if (lowerQuery.includes("icu") || lowerQuery.includes("intensive care")) {
      const icuAssets = assetData.assets.filter(asset => {
        const zone = assetData.zones.find(z => z.id === asset.location?.zoneId)
        return zone?.name?.toLowerCase().includes("icu")
      })

      const availableForTransfer = assetData.assets.filter(asset => {
        const zone = assetData.zones.find(z => z.id === asset.location?.zoneId)
        return !zone?.name?.toLowerCase().includes("icu") && 
               asset.status === "available" && 
               asset.utilization < 30 &&
               (asset.type.includes("Monitor") || asset.type.includes("Ventilator") || 
                asset.type.includes("Pump") || asset.type.includes("Defibrillator"))
      }).slice(0, 5)

      if (availableForTransfer.length === 0) {
        return `🏥 ICU Equipment Status:\n\n📊 Current ICU Assets: ${icuAssets.length}\n\n✅ No suitable equipment available for immediate transfer. All critical care equipment is currently well-utilized in their respective departments.\n\n💡 Recommendations:\n• Monitor utilization trends for future opportunities\n• Consider equipment sharing protocols\n• Review ICU-specific equipment needs\n• Plan for emergency reallocation procedures`
      }

      const transferList = availableForTransfer.map(asset => {
        const zone = assetData.zones.find(z => z.id === asset.location?.zoneId)
        return `• ${asset.name} (${asset.type})\n  Current utilization: ${asset.utilization}% in ${zone?.name || 'Unknown'}\n  Transfer priority: ${asset.utilization < 20 ? 'High' : 'Medium'}`
      }).join('\n\n')

      return `🚨 ICU Transfer Opportunities:\n\n${transferList}\n\n📋 Transfer Benefits:\n• Improve ICU equipment availability\n• Optimize underutilized resources\n• Enhance patient care capacity\n• Reduce equipment idle time\n\n⚠️ Next Steps:\n• Coordinate with department heads for approval\n• Schedule equipment transfers during low-activity periods\n• Update inventory tracking systems\n• Monitor post-transfer utilization`
    }

    // Maintenance schedules
    if (lowerQuery.includes("maintenance") && (lowerQuery.includes("near") || lowerQuery.includes("due") || lowerQuery.includes("upcoming") || lowerQuery.includes("schedule"))) {
      const upcomingMaintenance = assetData.maintenanceTasks.filter((task: any) => {
        const scheduledDate = new Date(task.scheduledDate)
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        return task.status === "pending" && scheduledDate <= thirtyDaysFromNow
      }).sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())

      if (upcomingMaintenance.length === 0) {
        return "✅ Excellent! No maintenance tasks are scheduled for the next 30 days. Your maintenance schedule is completely up to date!\n\n📊 Maintenance Status:\n• All equipment maintenance current\n• No overdue tasks\n• Preventive maintenance on track\n\n💡 Recommendations:\n• Continue proactive maintenance scheduling\n• Review long-term maintenance planning\n• Consider predictive maintenance opportunities"
      }

      const maintenanceList = upcomingMaintenance.slice(0, 5).map((task: any) => {
        const asset = assetData.assets.find(a => a.id === task.assetId)
        const daysUntil = Math.ceil((new Date(task.scheduledDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        const urgencyIcon = task.priority === "critical" ? "🚨" : task.priority === "high" ? "⚠️" : "📅"
        return `${urgencyIcon} ${asset?.name || 'Unknown Asset'}\n  Task: ${task.type} maintenance\n  Due: ${daysUntil} days (${task.priority} priority)\n  Assigned: ${task.assignedTo || 'Unassigned'}`
      }).join('\n\n')

      return `🔧 Upcoming Maintenance Schedule (Next 30 days):\n\n${maintenanceList}${upcomingMaintenance.length > 5 ? `\n\n...and ${upcomingMaintenance.length - 5} more tasks` : ''}\n\n📊 Schedule Overview:\n• Total tasks: ${upcomingMaintenance.length}\n• Critical priority: ${upcomingMaintenance.filter((t: any) => t.priority === "critical").length}\n• High priority: ${upcomingMaintenance.filter((t: any) => t.priority === "high").length}\n\n💡 Recommendations:\n• Review resource allocation for peak periods\n• Schedule during low-utilization hours\n• Prepare backup equipment if needed\n• Coordinate with department operations`
    }

    // Idle assets over 30 days
    if (lowerQuery.includes("idle") && lowerQuery.includes("30")) {
      const idleAssets = assetData.assets.filter(asset => {
        const lastActiveDate = new Date(asset.lastActive)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return lastActiveDate < thirtyDaysAgo && asset.status === "available"
      })

      if (idleAssets.length === 0) {
        return "🎉 Outstanding! No assets have been idle for more than 30 days. Your asset utilization management is extremely effective!\n\n📊 Utilization Excellence:\n• All assets active within 30 days\n• Optimal resource allocation\n• Effective asset tracking\n\n💡 Best Practices Maintained:\n• Continue current monitoring procedures\n• Maintain proactive asset management\n• Regular utilization reviews are working well"
      }

      const idleList = idleAssets.slice(0, 5).map(asset => {
        const zone = assetData.zones.find(z => z.id === asset.location?.zoneId)
        const idleDays = Math.floor((Date.now() - new Date(asset.lastActive).getTime()) / (24 * 60 * 60 * 1000))
        const criticality = idleDays > 90 ? "🔴 Critical" : idleDays > 60 ? "🟡 High" : "🟢 Medium"
        return `• ${asset.name} (${asset.type})\n  Location: ${zone?.name || 'Unknown'}\n  Idle duration: ${idleDays} days\n  Action needed: ${criticality}`
      }).join('\n\n')

      return `⚠️ Found ${idleAssets.length} assets idle for over 30 days:\n\n${idleList}${idleAssets.length > 5 ? `\n\n...and ${idleAssets.length - 5} more assets` : ''}\n\n📊 Idle Analysis:\n• 30-60 days idle: ${idleAssets.filter(a => {
        const days = Math.floor((Date.now() - new Date(a.lastActive).getTime()) / (24 * 60 * 60 * 1000))
        return days >= 30 && days <= 60
      }).length}\n• 60-90 days idle: ${idleAssets.filter(a => {
        const days = Math.floor((Date.now() - new Date(a.lastActive).getTime()) / (24 * 60 * 60 * 1000))
        return days > 60 && days <= 90
      }).length}\n• 90+ days idle: ${idleAssets.filter(a => {
        const days = Math.floor((Date.now() - new Date(a.lastActive).getTime()) / (24 * 60 * 60 * 1000))
        return days > 90
      }).length}\n\n🔧 Recommended Actions:\n• Immediate redistribution for 90+ day idle assets\n• Maintenance checks for extended idle equipment\n• Consider disposal/replacement for obsolete items\n• Review department needs and reallocate accordingly`
    }

    // Utilization trends analysis
    if (lowerQuery.includes("trend") || lowerQuery.includes("analysis") || lowerQuery.includes("analyze") || lowerQuery.includes("utilization")) {
      const avgUtilization = assetData.assetLocatorData?.stats?.avgUtilization || 0
      const underutilizedCount = assetData.assetLocatorData?.stats?.underutilized || 0
      const totalAssets = assetData.assets.length

      const utilizationTrend = assetData.assetLocatorData?.utilization?.utilizationTrend || []
      const recentTrend = utilizationTrend.slice(-7) // Last 7 days
      
      let trendDirection = "stable"
      let trendPercentage = 0
      if (recentTrend.length >= 2) {
        const startUtil = recentTrend[0].utilization
        const endUtil = recentTrend[recentTrend.length - 1].utilization
        trendPercentage = ((endUtil - startUtil) / startUtil) * 100
        if (endUtil > startUtil + 5) trendDirection = "improving"
        else if (endUtil < startUtil - 5) trendDirection = "declining"
      }

      const topDepartments = assetData.assetLocatorData?.utilization?.departmentUtilization?.slice(0, 3) || []
      const departmentAnalysis = topDepartments.map((dept: any) => 
        `• ${dept.departmentName}: ${dept.avgUtilization}% avg utilization (${dept.totalAssets} assets)`
      ).join('\n')

      const trendIcon = trendDirection === "improving" ? "📈" : trendDirection === "declining" ? "📉" : "📊"

      return `${trendIcon} Comprehensive Utilization Analysis:\n\n📊 Overall Performance Metrics:\n• Average utilization: ${avgUtilization}%\n• Total assets: ${totalAssets}\n• Underutilized assets: ${underutilizedCount} (${Math.round(underutilizedCount/totalAssets*100)}%)\n• Well-utilized assets: ${totalAssets - underutilizedCount} (${Math.round((totalAssets - underutilizedCount)/totalAssets*100)}%)\n\n📈 7-Day Trend: ${trendDirection.toUpperCase()}\n• Trend direction: ${trendPercentage > 0 ? '+' : ''}${trendPercentage.toFixed(1)}%\n• Performance status: ${avgUtilization > 70 ? 'Excellent' : avgUtilization > 50 ? 'Good' : avgUtilization > 30 ? 'Fair' : 'Needs Improvement'}\n\n🏥 Top Performing Departments:\n${departmentAnalysis}\n\n💡 Strategic Recommendations:\n${trendDirection === "declining" ? "• Immediate action needed: Investigate causes of utilization decline\n• Review staffing levels and operational procedures\n• Consider equipment redistribution\n• Implement corrective measures" : trendDirection === "improving" ? "• Excellent progress: Continue current strategies\n• Document successful practices for replication\n• Monitor for sustained improvement\n• Consider expanding successful initiatives" : "• Maintain current performance while exploring optimization\n• Regular monitoring and preventive measures\n• Identify improvement opportunities\n• Prepare for seasonal variations"}`
    }

    // Predictive maintenance insights
    if (lowerQuery.includes("predict") || lowerQuery.includes("risk") || lowerQuery.includes("failure") || lowerQuery.includes("immediate attention")) {
      const predictiveData = assetData.predictiveMaintenanceData
      const highRiskAssets = predictiveData?.top5AtRisk || []
      const totalMonitored = predictiveData?.summary?.totalAssetsMonitored || 0
      const avgConfidence = predictiveData?.summary?.avgConfidenceScore || 0
      const potentialSavings = predictiveData?.summary?.potentialCostSavings || 0

      if (highRiskAssets.length === 0) {
        return `✅ Predictive Maintenance Analysis - All Clear!\n\n📊 System Status:\n• No high-risk assets identified\n• ${totalMonitored} assets under AI monitoring\n• Average prediction confidence: ${avgConfidence}%\n• Potential cost savings maintained: $${potentialSavings.toLocaleString()}\n\n🎯 Equipment Health:\n• All equipment operating within normal parameters\n• Predictive algorithms detecting no anomalies\n• Preventive maintenance schedules optimized\n\n💡 Recommendations:\n• Continue routine maintenance schedules\n• Maintain current monitoring protocols\n• Regular system health checks\n• Prepare for future predictive opportunities`
      }

      const riskList = highRiskAssets.slice(0, 3).map((asset: any, index: number) => {
        const riskIcon = asset.riskLevel === "high" ? "🚨" : asset.riskLevel === "medium" ? "⚠️" : "🔍"
        return `${riskIcon} ${asset.assetName} (${asset.assetType})\n  Issue: ${asset.predictedIssue}\n  Confidence: ${asset.confidenceScore}% prediction accuracy\n  Timeline: ${asset.predictedFailureWindow} days remaining\n  Location: ${asset.location}\n  Action: ${asset.recommendedAction}`
      }).join('\n\n')

      const riskDistribution = predictiveData?.riskDistribution || []
      const riskSummary = riskDistribution.map((risk: any) => 
        `• ${risk.name}: ${risk.count} assets (${risk.value}%)`
      ).join('\n')

      return `🤖 AI-Powered Predictive Maintenance Alert:\n\n⚠️ Assets Requiring Immediate Attention:\n\n${riskList}\n\n📊 Risk Distribution Overview:\n${riskSummary}\n\n🎯 Monitoring Statistics:\n• Total assets monitored: ${totalMonitored}\n• Average prediction confidence: ${avgConfidence}%\n• High-risk assets: ${predictiveData?.summary?.highRiskAssets || 0}\n• Medium-risk assets: ${predictiveData?.summary?.mediumRiskAssets || 0}\n\n💰 Financial Impact:\n• Potential cost savings: $${potentialSavings.toLocaleString()}\n• Prevented failure costs\n• Optimized maintenance scheduling\n\n🚨 Immediate Action Items:\n• Schedule emergency inspections for high-risk assets\n• Prepare replacement parts and resources\n• Coordinate with maintenance teams\n• Update maintenance schedules based on predictions\n• Monitor asset performance closely`
    }

    // Department comparison
    if (lowerQuery.includes("department") && (lowerQuery.includes("compare") || lowerQuery.includes("performance"))) {
      const departmentData = assetData.assetLocatorData?.utilization?.departmentUtilization || []
      
      if (departmentData.length === 0) {
        return "No department comparison data available at this time."
      }

      const topPerformer = departmentData[0]
      const bottomPerformer = departmentData[departmentData.length - 1]
      
      const departmentList = departmentData.slice(0, 5).map((dept: any, index: number) => {
        const rank = index + 1
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`
        return `${medal} ${dept.departmentName}\n  Average utilization: ${dept.avgUtilization}%\n  Total assets: ${dept.totalAssets}\n  Active assets: ${dept.active}\n  Idle assets: ${dept.idle}\n  Under maintenance: ${dept.inMaintenance}`
      }).join('\n\n')

      return `🏆 Department Performance Comparison:\n\n${departmentList}\n\n📊 Key Performance Insights:\n• Best performing: ${topPerformer.departmentName} (${topPerformer.avgUtilization}%)\n• Needs improvement: ${bottomPerformer.departmentName} (${bottomPerformer.avgUtilization}%)\n• Performance gap: ${topPerformer.avgUtilization - bottomPerformer.avgUtilization} percentage points\n\n💡 Optimization Opportunities:\n• Share best practices from top performers\n• Analyze workflow differences\n• Consider asset redistribution\n• Provide targeted support for underperforming departments\n• Implement performance improvement initiatives`
    }

    // Cost-saving opportunities
    if (lowerQuery.includes("cost") && (lowerQuery.includes("saving") || lowerQuery.includes("save") || lowerQuery.includes("opportunity"))) {
      const redistributionSavings = assetData.assetLocatorData?.utilization?.redistributionSuggestions?.reduce((sum: number, s: any) => sum + s.estimatedSavings, 0) || 0
      const predictiveSavings = assetData.predictiveMaintenanceData?.summary?.potentialCostSavings || 0
      const idleAssets = assetData.assets.filter(asset => {
        const lastActiveDate = new Date(asset.lastActive)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return lastActiveDate < thirtyDaysAgo && asset.status === "available"
      })
      
      const idleCostSavings = idleAssets.reduce((sum, asset) => sum + (asset.value || 5000) * 0.1, 0) // Estimate 10% of asset value annually for idle cost

      const totalSavings = redistributionSavings + predictiveSavings + idleCostSavings

      return `💰 Cost-Saving Opportunities Analysis:\n\n🎯 Total Potential Savings: $${totalSavings.toLocaleString()}\n\n📊 Savings Breakdown:\n• Asset redistribution: $${redistributionSavings.toLocaleString()}\n  - Optimize underutilized equipment\n  - Improve departmental efficiency\n\n• Predictive maintenance: $${predictiveSavings.toLocaleString()}\n  - Prevent equipment failures\n  - Reduce emergency repairs\n\n• Idle asset optimization: $${Math.round(idleCostSavings).toLocaleString()}\n  - Reduce idle equipment costs\n  - Improve asset utilization\n\n🚀 Quick Win Opportunities:\n• ${idleAssets.length} idle assets to redistribute\n• ${assetData.assetLocatorData?.utilization?.redistributionSuggestions?.length || 0} redistribution opportunities\n• ${assetData.predictiveMaintenanceData?.summary?.highRiskAssets || 0} high-risk assets to address\n\n💡 Implementation Strategy:\n• Priority 1: Address high-risk predictive maintenance items\n• Priority 2: Redistribute underutilized assets\n• Priority 3: Optimize idle asset management\n• Priority 4: Implement continuous monitoring systems\n\n📈 Expected ROI: ${Math.round((totalSavings / (assetData.assets.length * 10000)) * 100)}% improvement in asset efficiency`
    }

    // General asset information
    if (lowerQuery.includes("how many") || lowerQuery.includes("total") || lowerQuery.includes("count") || lowerQuery.includes("summary") || lowerQuery.includes("overview")) {
      const totalAssets = assetData.assets.length
      const available = assetData.assets.filter(a => a.status === "available").length
      const inUse = assetData.assets.filter(a => a.status === "in-use").length
      const maintenance = assetData.assets.filter(a => a.status === "maintenance").length
      const lost = assetData.assets.filter(a => a.status === "lost").length

      const topTypes = assetData.assets.reduce((acc: any, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1
        return acc
      }, {})

      const topTypesList = Object.entries(topTypes)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([type, count], index) => {
          const icon = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "📋"
          return `${icon} ${type}: ${count} units`
        })
        .join('\n')

      const avgUtilization = Math.round(assetData.assets.reduce((sum, a) => sum + a.utilization, 0) / totalAssets)

      return `📊 Comprehensive Asset Inventory Summary:\n\n🏢 Total Asset Portfolio: ${totalAssets} units\n\n📈 Status Distribution:\n• Available: ${available} units (${Math.round(available/totalAssets*100)}%)\n• In Active Use: ${inUse} units (${Math.round(inUse/totalAssets*100)}%)\n• Under Maintenance: ${maintenance} units (${Math.round(maintenance/totalAssets*100)}%)\n• Lost/Missing: ${lost} units (${Math.round(lost/totalAssets*100)}%)\n\n⚡ Performance Metrics:\n• Average utilization: ${avgUtilization}%\n• Asset availability rate: ${Math.round((available + inUse)/totalAssets*100)}%\n• Maintenance rate: ${Math.round(maintenance/totalAssets*100)}%\n\n🔧 Top Equipment Categories:\n${topTypesList}\n\n🏥 Department Coverage: ${assetData.departments.length} departments\n📍 Location Coverage: ${assetData.zones.length} zones\n\n💡 Key Insights:\n• ${totalAssets > 5000 ? 'Large-scale' : totalAssets > 1000 ? 'Medium-scale' : 'Focused'} asset portfolio\n• ${avgUtilization > 70 ? 'Excellent' : avgUtilization > 50 ? 'Good' : 'Improvement needed'} utilization performance\n• ${lost === 0 ? 'Perfect' : lost < totalAssets * 0.02 ? 'Excellent' : 'Needs attention'} asset tracking accuracy`
    }

    // Default response for unrecognized queries
    return `🤖 I understand you're asking about "${query}". I'm here to help with comprehensive asset management analysis!\n\n🎯 My Capabilities:\n• Asset utilization analysis and optimization\n• Maintenance scheduling and predictive insights\n• Equipment redistribution recommendations\n• Department performance comparisons\n• Cost-saving opportunity identification\n• Asset inventory summaries and reporting\n• Predictive maintenance alerts\n• Risk assessment and mitigation strategies\n\n💡 Try asking questions like:\n• "Which assets are underutilized?"\n• "Show upcoming maintenance tasks"\n• "Compare department performance"\n• "What are the cost-saving opportunities?"\n• "Analyze utilization trends"\n• "Show predictive maintenance insights"\n\nI'm analyzing data from ${assetData.assets.length} assets across ${assetData.departments.length} departments to provide you with actionable insights!`
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage = { role: "user" as const, content: message, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Add a realistic processing delay
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const response = analyzeQuery(message)
      const assistantMessage = { role: "assistant" as const, content: response, timestamp: new Date() }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = { 
        role: "assistant" as const, 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or try rephrasing your question.", 
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  const clearConversation = () => {
    setMessages([{
      role: "assistant",
      content: "Conversation cleared! I'm ready to help you with new asset management insights. What would you like to analyze?",
      timestamp: new Date()
    }])
  }

  const refreshData = async () => {
    setIsDataLoading(true)
    // Trigger data reload
    window.location.reload()
  }

  return (
    <AILayout>
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 sm:p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg" style={{ backgroundColor: "#0d7a8c" }}>
                <BrainCog className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-2xl font-light" style={{ color: "#001f3f" }}>AI Assistant</h1>
                {assetData && (
                  <p className="text-xs sm:text-sm text-green-600 mt-1">
                    ✓ Connected to {assetData.assets.length} assets across {assetData.departments.length} departments
                  </p>
                )}
                {isDataLoading && (
                  <p className="text-xs sm:text-sm text-amber-600 mt-1">
                    ⏳ Loading asset data...
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={refreshData}
                disabled={isDataLoading}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>
              <button
                onClick={clearConversation}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors duration-200 flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 lg:gap-6 p-4 sm:p-6 min-h-0">
          {/* Chat Interface - Full width on mobile, shared on desktop */}
          <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] sm:max-w-[80%] flex items-start gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg" style={{ backgroundColor: "#0d7a8c" }}>
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg" style={{ backgroundColor: "#0d7a8c" }}>
                        <span className="text-xs sm:text-sm font-semibold text-white">You</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div
                        className={`p-3 sm:p-4 rounded-2xl shadow-sm ${
                          msg.role === "user"
                            ? "text-white rounded-br-md"
                            : "bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-md"
                        }`}
                        style={msg.role === "user" ? { backgroundColor: "#0d7a8c" } : {}}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 px-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg" style={{ backgroundColor: "#0d7a8c" }}>
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 sm:p-4 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#0d7a8c" }}></div>
                          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#0d7a8c", animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#0d7a8c", animationDelay: "0.2s" }}></div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">Analyzing your request...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Sticky at bottom */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200/50 bg-gray-50/50">
              <div className="flex items-end gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your assets, utilization, maintenance, or optimization opportunities..."
                    disabled={isLoading}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm disabled:opacity-50 transition-all duration-200 bg-white shadow-sm"
                    style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
                  />
                  <MessageCircle className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg disabled:hover:scale-100"
                  style={{ backgroundColor: "#0d7a8c" }}
                >
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Suggested Prompts Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:flex lg:w-80 flex-shrink-0">
            <div className="w-full max-h-full overflow-y-auto space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-4">Quick Insights</h3>
                <div className="space-y-3">
                  {suggestedPrompts.slice(0, 6).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading}
                      className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-start gap-3">
                        <Zap className="w-4 h-4 text-teal-600 opacity-75 group-hover:opacity-100 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 group-hover:text-teal-700 leading-relaxed">{prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-4">More Prompts</h3>
                <div className="space-y-3">
                  {suggestedPrompts.slice(6).map((prompt, index) => (
                    <button
                      key={index + 6}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading}
                      className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-start gap-3">
                        <Bot className="w-4 h-4 text-purple-600 opacity-75 group-hover:opacity-100 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 group-hover:text-purple-700 leading-relaxed">{prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AILayout>
  )
}
