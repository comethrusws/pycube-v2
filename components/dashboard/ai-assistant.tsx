"use client"

import { useState, useRef, useEffect } from "react"
import { X, Bot, Send, Sparkles, MessageCircle, Zap } from "lucide-react"

const suggestedPrompts = [
  "Which assets are underutilized today?",
  "Recommend asset reallocations across departments",
  "Show equipment that can be transferred to ICU",
  "List assets nearing maintenance schedules",
  "Find idle assets over 30 days",
  "Analyze utilization trends this month"
]

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      // Simulate AI response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockResponses = [
        "Based on current data, I found 12 underutilized assets in the ICU department. The MRI Scanner in Zone A has only 23% utilization this week. I recommend scheduling maintenance during low-usage periods.",
        "I've analyzed your asset distribution. Consider moving 3 unused ventilators from Emergency to ICU, and relocating the portable X-ray unit to Surgery for better utilization.",
        "Here are 5 assets that can be transferred to ICU: 2 Patient monitors (current util: 15%), 1 Infusion pump (util: 8%), 1 Wheelchair (unused for 14 days), and 1 Portable ultrasound (util: 22%).",
        "I found 8 assets requiring maintenance attention: 3 in next 7 days, 2 overdue, and 3 showing early warning signs. The CT Scanner in Radiology needs immediate attention."
      ]
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }])
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
          <Bot className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-yellow-400 animate-pulse opacity-75" />
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
                  <p className="text-sm leading-relaxed">{msg.content}</p>
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
                    <span className="text-sm text-gray-500 ml-2">Analyzing...</span>
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
