"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"

interface LoginPageProps {
  onLogin: (email: string, password: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Validate credentials - only allow demo@pycube.com with password Turing123
    if (email === "demo@pycube.com" && password === "Turing123") {
      onLogin(email, password)
    } else {
      setError("Invalid credentials. Please use the demo credentials provided below.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center" style={{ backgroundColor: "#001f3f" }}>
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-light mb-16">Experience the Power of Precision!</h1>
          <div className="space-y-12">
            {/* Locate */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#0d7a8c" }}
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
                  </svg>
                </div>
                <div className="w-1 h-12 bg-white/30"></div>
              </div>
              <div>
                <h3 className="text-xl font-light mb-2" style={{ color: "#0d7a8c" }}>
                  Locate
                </h3>
                <p className="text-sm text-white/80">
                  Search and locate life-saving equipment exactly when needed, ensuring timely response in critical
                  moments!
                </p>
              </div>
            </div>
            {/* Control */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#e8495c" }}
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                  </svg>
                </div>
                <div className="w-1 h-12 bg-white/30"></div>
              </div>
              <div>
                <h3 className="text-xl font-light mb-2" style={{ color: "#e8495c" }}>
                  Control
                </h3>
                <p className="text-sm text-white/80">
                  Learn more about Intelligent Location System, a cost effective solution designed to track assets.
                </p>
              </div>
            </div>
            {/* Protect */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#c41e3a" }}
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-light mb-2" style={{ color: "#c41e3a" }}>
                  Protect
                </h3>
                <p className="text-sm text-white/80">
                  Our GUID Inventory solution positions you at the forefront of compliance, ensuring you not only meet
                  but exceed industry standards with ease.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-12">
            <Image src="/pycube-logo.svg" alt="Pycube" width={160} height={45} className="h-12 w-auto" />
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#0d7a8c" }}>
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
              <h2 className="text-lg font-light" style={{ color: "#001f3f" }}>
                Login
              </h2>
            </div>
            <p className="text-sm text-gray-600">Enter email for your organization login page</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#001f3f" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#001f3f" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-medium py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0d7a8c" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {isLoading ? "Logging in..." : "LOGIN"}
            </button>
          </form>

          {/* Reset Password */}
          <div className="mt-6 text-center">
            <button className="text-sm transition-opacity hover:opacity-80" style={{ color: "#0d7a8c" }}>
              Reset Password
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
