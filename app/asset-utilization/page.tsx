"use client"
import { Suspense } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import AssetLocatorPageContent from "@/components/asset-locator/asset-locator-page-content"

function AssetLocatorPageFallback() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <div className="py-2 px-1 border-b-2 border-teal-500 text-teal-600 font-medium text-sm">
              Dashboard
            </div>
            <div className="py-2 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm">
              Location Lists
            </div>
          </nav>
        </div>
      </div>
      <div className="-mx-6 -mb-6">
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AssetLocatorPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<AssetLocatorPageFallback />}>
        <AssetLocatorPageContent />
      </Suspense>
    </DashboardLayout>
  )
}
