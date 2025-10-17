"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginPage from "@/components/auth/login-page"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("pycube_auth")
    if (storedAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (email: string, password: string) => {
    if (email && password) {
      sessionStorage.setItem("pycube_auth", "true")
      setIsAuthenticated(true)
      router.push("/dashboard")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f5f5" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "#001f3f" }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <DashboardLayout />
}
