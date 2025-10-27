"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Bot } from "lucide-react"

const suggestedPrompts = [
  "Which assets are underutilized today?",
  "Recommend asset reallocations across departments.",
  "Show equipment that can be transferred to the ICU.",
  "List assets nearing overuse or underuse thresholds.",
]

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen && messages.length === 0) {
      // Add a welcome message when the chat is opened for the first time
      setMessages([{ role: "assistant", content: "Hello! How can I help you with asset management today?" }])
    }
  }

  const handlePromptClick = async (prompt: string) => {
    setMessages((prev) => [...prev, { role: "user", content: prompt }])
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't fetch a response. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={handleToggle}
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        <Bot className="w-8 h-8" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-8 right-8 w-[400px] h-[600px] flex flex-col z-50">
      <Card className="flex-1 flex flex-col shadow-2xl rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800 text-white rounded-t-lg p-4">
          <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleToggle} className="text-white hover:bg-slate-700">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-800 p-3 rounded-lg">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="text-left h-auto"
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
