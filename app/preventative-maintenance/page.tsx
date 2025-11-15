"use client"
import { Suspense } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import PreventativeMaintenanceDashboard from "@/components/preventative-maintenance/preventative-maintenance-dashboard"

function PreventativeMaintenanceFallback() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    </div>
  )
}

export default function PreventativeMaintenancePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<PreventativeMaintenanceFallback />}>
        <PreventativeMaintenanceDashboard />
      </Suspense>
    </DashboardLayout>
  )
}
