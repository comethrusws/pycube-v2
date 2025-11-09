"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AssetUtilizationDashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/asset-utilization")
  }, [router])

  return null
}
