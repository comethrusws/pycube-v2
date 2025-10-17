"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import AssetLocatorDashboard from "./asset-locator-dashboard"
import AssetLocatorContent from "./asset-locator-content"

export default function AssetLocatorPageContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<"dashboard" | "lists">("dashboard")

  useEffect(() => {
    if (tabParam === "lists") {
      setActiveTab("lists")
    } else {
      setActiveTab("dashboard")
    }
  }, [tabParam])

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("lists")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "lists"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Location Lists
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="-mx-6 -mb-6">
        {activeTab === "dashboard" ? (
          <AssetLocatorDashboard />
        ) : (
          <AssetLocatorContent />
        )}
      </div>
    </div>
  )
}
