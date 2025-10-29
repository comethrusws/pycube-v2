"use client"

import { useState, useRef, useEffect } from "react"
import { X, Bot, Send, Sparkles, MessageCircle, Zap, BrainCog } from "lucide-react"
import { usePathname } from "next/navigation"
import { getAIAssistantPrompts } from "@/lib/ai-prompts"
import { apiGet } from "@/lib/fetcher"



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

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [assetData, setAssetData] = useState<AssetData | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  const suggestedPrompts = getAIAssistantPrompts(pathname)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load asset data when component mounts
  useEffect(() => {
    const loadAssetData = async () => {
      try {
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
        return "Great news! All assets are currently well-utilized with utilization rates above 40%. Your asset management is performing excellently."
      }

      const examples = underutilizedAssets.slice(0, 5).map(asset => {
        const zone = assetData.zones.find(z => z.id === asset.location?.zoneId)
        return `• ${asset.name} (${asset.type}) - ${asset.utilization}% utilization in ${zone?.name || 'Unknown location'}`
      }).join('\n')

      return `I found ${count} underutilized assets (below 40% utilization):\n\n${examples}${count > 5 ? `\n\n...and ${count - 5} more assets` : ''}\n\nRecommendation: Consider redistributing these assets to high-demand areas or scheduling maintenance reviews.`
    }

    // Asset reallocation recommendations
    if (lowerQuery.includes("reallocation") || lowerQuery.includes("redistribution") || lowerQuery.includes("transfer") || lowerQuery.includes("move")) {
      const redistributionSuggestions = assetData.assetLocatorData?.utilization?.redistributionSuggestions || []
      
      if (redistributionSuggestions.length === 0) {
        return "Current asset distribution appears optimal. No immediate redistribution recommendations at this time."
      }

      const suggestions = redistributionSuggestions.slice(0, 3).map((suggestion: any) => 
        `• Move ${suggestion.assetName} from ${suggestion.fromDepartment} to ${suggestion.toDepartment} - Expected impact: ${suggestion.potentialImpact} (Est. savings: $${suggestion.estimatedSavings})`
      ).join('\n')

      return `Based on utilization analysis, here are my top redistribution recommendations:\n\n${suggestions}\n\nThese moves could significantly improve overall asset utilization and reduce operational costs.`
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
        return `ICU currently has ${icuAssets.length} assets. No suitable equipment available for immediate transfer. All critical care equipment is currently well-utilized.`
      }

      const transferList = availableForTransfer.map(asset => {
        const zone = assetData.zones.find(z => z.id === asset.location?.zoneId)
        return `• ${asset.name} (${asset.type}) - Currently ${asset.utilization}% utilized in ${zone?.name || 'Unknown'}`
      }).join('\n')

      return `ICU Transfer Recommendations:\n\n${transferList}\n\nThese assets are underutilized in their current locations and would be valuable in the ICU. Consider coordinating with department heads for transfer approval.`
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
        return "No maintenance tasks are scheduled for the next 30 days. Your maintenance schedule is up to date!"
      }

      const maintenanceList = upcomingMaintenance.slice(0, 5).map((task: any) => {
        const asset = assetData.assets.find(a => a.id === task.assetId)
        const daysUntil = Math.ceil((new Date(task.scheduledDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        return `• ${asset?.name || 'Unknown Asset'} - ${task.type} maintenance in ${daysUntil} days (${task.priority} priority)`
      }).join('\n')

      return `Upcoming Maintenance Schedule (Next 30 days):\n\n${maintenanceList}${upcomingMaintenance.length > 5 ? `\n\n...and ${upcomingMaintenance.length - 5} more tasks` : ''}\n\nRecommendation: Review resource allocation and consider scheduling during low-utilization periods.`
    }

    // Idle assets over 30 days
    if (lowerQuery.includes("idle") && lowerQuery.includes("30")) {
      const idleAssets = assetData.assets.filter(asset => {
        const lastActiveDate = new Date(asset.lastActive)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return lastActiveDate < thirtyDaysAgo && asset.status === "available"
      })

      if (idleAssets.length === 0) {
        return "Excellent! No assets have been idle for more than 30 days. Your asset utilization management is very effective."
      }

      const idleList = idleAssets.slice(0, 5).map(asset => {
        const zone = assetData.zones.find(z => z.id === asset.location?.zoneId)
        const idleDays = Math.floor((Date.now() - new Date(asset.lastActive).getTime()) / (24 * 60 * 60 * 1000))
        return `• ${asset.name} (${asset.type}) - Idle for ${idleDays} days in ${zone?.name || 'Unknown'}`
      }).join('\n')

      return `Found ${idleAssets.length} assets idle for over 30 days:\n\n${idleList}${idleAssets.length > 5 ? `\n\n...and ${idleAssets.length - 5} more assets` : ''}\n\nRecommendation: These assets may need redistribution, maintenance checks, or could be candidates for disposal/replacement.`
    }

    // Utilization trends analysis
    if (lowerQuery.includes("trend") || lowerQuery.includes("analysis") || lowerQuery.includes("analyze") || lowerQuery.includes("utilization")) {
      const avgUtilization = assetData.assetLocatorData?.stats?.avgUtilization || 0
      const underutilizedCount = assetData.assetLocatorData?.stats?.underutilized || 0
      const totalAssets = assetData.assets.length

      const utilizationTrend = assetData.assetLocatorData?.utilization?.utilizationTrend || []
      const recentTrend = utilizationTrend.slice(-7) // Last 7 days
      
      let trendDirection = "stable"
      if (recentTrend.length >= 2) {
        const startUtil = recentTrend[0].utilization
        const endUtil = recentTrend[recentTrend.length - 1].utilization
        if (endUtil > startUtil + 5) trendDirection = "improving"
        else if (endUtil < startUtil - 5) trendDirection = "declining"
      }

      const topDepartments = assetData.assetLocatorData?.utilization?.departmentUtilization?.slice(0, 3) || []
      const departmentAnalysis = topDepartments.map((dept: any) => 
        `• ${dept.departmentName}: ${dept.avgUtilization}% average utilization`
      ).join('\n')

      return `Asset Utilization Analysis:\n\n📊 Overall Performance:\n• Average utilization: ${avgUtilization}%\n• Underutilized assets: ${underutilizedCount} of ${totalAssets} (${Math.round(underutilizedCount/totalAssets*100)}%)\n• 7-day trend: ${trendDirection}\n\n🏥 Top Performing Departments:\n${departmentAnalysis}\n\nRecommendation: ${trendDirection === "declining" ? "Focus on identifying causes of utilization decline and implement corrective measures." : trendDirection === "improving" ? "Continue current strategies - utilization is trending positively." : "Maintain current performance while exploring optimization opportunities."}`
    }

    // Predictive maintenance insights
    if (lowerQuery.includes("predict") || lowerQuery.includes("risk") || lowerQuery.includes("failure")) {
      const predictiveData = assetData.predictiveMaintenanceData
      const highRiskAssets = predictiveData?.top5AtRisk || []
      const totalMonitored = predictiveData?.summary?.totalAssetsMonitored || 0
      const avgConfidence = predictiveData?.summary?.avgConfidenceScore || 0

      if (highRiskAssets.length === 0) {
        return `Predictive Analysis Summary:\n\n✅ No high-risk assets identified\n📊 ${totalMonitored} assets under monitoring\n🎯 Average prediction confidence: ${avgConfidence}%\n\nAll equipment is operating within normal parameters. Continue routine maintenance schedules.`
      }

      const riskList = highRiskAssets.slice(0, 3).map((asset: any) => 
        `• ${asset.assetName} - ${asset.predictedIssue} (${asset.confidenceScore}% confidence, ${asset.predictedFailureWindow} days remaining)`
      ).join('\n')

      return `Predictive Maintenance Alert:\n\n⚠️ High-Risk Assets Requiring Attention:\n${riskList}\n\n📊 Monitoring Status:\n• Total assets monitored: ${totalMonitored}\n• Average confidence: ${avgConfidence}%\n• Potential cost savings: $${predictiveData?.summary?.potentialCostSavings?.toLocaleString() || 0}\n\nRecommendation: Schedule immediate inspections for high-risk assets to prevent failures.`
    }

    // General asset information
    if (lowerQuery.includes("how many") || lowerQuery.includes("total") || lowerQuery.includes("count") || lowerQuery.includes("summary")) {
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
        .map(([type, count]) => `• ${type}: ${count}`)
        .join('\n')

      return `Asset Inventory Summary:\n\n📊 Total Assets: ${totalAssets}\n\n📋 Status Breakdown:\n• Available: ${available} (${Math.round(available/totalAssets*100)}%)\n• In Use: ${inUse} (${Math.round(inUse/totalAssets*100)}%)\n• Under Maintenance: ${maintenance} (${Math.round(maintenance/totalAssets*100)}%)\n• Lost/Missing: ${lost} (${Math.round(lost/totalAssets*100)}%)\n\n🔧 Top Equipment Types:\n${topTypesList}`
    }

    // Default response for unrecognized queries
    return `I understand you're asking about "${query}". I can help you with:\n\n• Asset utilization analysis\n• Maintenance scheduling and recommendations\n• Equipment redistribution suggestions\n• Predictive maintenance insights\n• Asset inventory summaries\n• Department performance analysis\n\nTry asking something like "Which assets are underutilized?" or "Show upcoming maintenance tasks" for more specific insights.`
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen && messages.length === 0) {
      setMessages([{ 
        role: "assistant", 
        content: "Hello! I'm your AI assistant for asset management. I can help you analyze utilization patterns, recommend optimizations, and provide insights about your equipment. How can I assist you today?" 
      }])
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    setMessages((prev) => [...prev, { role: "user", content: message }])
    setInputValue("")
    setIsLoading(true)

    try {
      // Add a small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const response = analyzeQuery(message)
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error) {
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment." 
      }])
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

  if (!isOpen) {
    return (
      <button
        onClick={handleToggle}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 z-50 group"
        style={{ backgroundColor: "#0d7a8c" }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          <BrainCog className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
        </div>
      </button>
    )
  }

  return (
    <div className="fixed bottom-8 right-8 w-[420px] h-[650px] flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: "#001f3f" }}>AI Assistant</h3>
              <p className="text-xs text-gray-500">Asset Management Expert</p>
              {assetData && (
                <p className="text-xs text-green-600">
                  ✓ Connected to {assetData.assets.length} assets
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleToggle}
            className="w-8 h-8 rounded-full bg-gray-100/50 hover:bg-gray-200/50 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/30 to-white/30">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: "#0d7a8c" }}>
                    <span className="text-xs font-semibold text-white">You</span>
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "text-white rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                  style={msg.role === "user" ? { backgroundColor: "#0d7a8c" } : {}}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">Analyzing data...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 border-t border-gray-100/50 bg-gradient-to-r from-slate-50/50 to-gray-50/50">
            <p className="text-xs text-gray-500 mb-3 font-medium">Try asking about:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="text-left p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-teal-600 opacity-75 group-hover:opacity-100" />
                    <span className="text-gray-700 group-hover:text-teal-700">{prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-100/50 bg-white/80">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about asset utilization, maintenance, or optimization..."
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent text-sm disabled:opacity-50 transition-all duration-200"
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
              />
              <MessageCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              style={{ backgroundColor: "#0d7a8c" }}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
