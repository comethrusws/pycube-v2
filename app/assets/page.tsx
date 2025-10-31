"use client"
import { Suspense } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import AssetsContent from "@/components/assets/assets-content"

export default function AssetsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <AssetsContent />
      </Suspense>
    </DashboardLayout>
  )
}
