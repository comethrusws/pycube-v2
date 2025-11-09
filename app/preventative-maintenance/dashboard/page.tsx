"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PreventativeMaintenanceDashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/preventative-maintenance")
  }, [router])

  return null
}
