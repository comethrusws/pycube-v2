"use client"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProductsContent from "@/components/products/products-content"
import { Suspense } from "react"

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsContent />
      </Suspense>
    </DashboardLayout>
  )
}
