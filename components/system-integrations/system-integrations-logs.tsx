"use client"

import { useState, useEffect } from "react"
import { apiGet } from "@/lib/fetcher"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Log {
  id: string
  timestamp: string
  level: "Info" | "Warning" | "Error"
  message: string
  integration: string
}

export default function SystemIntegrationsLogsContent() {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      const data = await apiGet<Log[]>("/api/system-integrations/logs")
      setLogs(data)
    } catch (error) {
      console.error("Failed to load logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Error':
        return 'bg-red-100 text-red-800'
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading) {
      return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#003d5c] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-[#003d5c] text-lg font-medium">Loading...</p>
        </div>
      )
    }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link href="/system-integrations"><ArrowLeft/></Link>
        <h1 className="text-3xl font-light text-gray-800">Integration Logs</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-sm font-medium text-gray-600">Timestamp</th>
                <th className="p-4 text-sm font-medium text-gray-600">Integration</th>
                <th className="p-4 text-sm font-medium text-gray-600">Level</th>
                <th className="p-4 text-sm font-medium text-gray-600">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b">
                  <td className="p-4 text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-gray-800">{log.integration}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
