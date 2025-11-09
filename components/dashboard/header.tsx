"use client"

import type React from "react"
import { Menu, Search, LogOut } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => {
    router.push("/")
    window.location.reload()
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu className="w-5 h-5" style={{ color: "#001f3f" }} />
        </button>
        <Image
          src="/pycube-logo.svg"
          alt="Pycube"
          width={120}
          height={32}
          className="h-6 w-auto sm:h-8 md:h-9 max-w-[100px] sm:max-w-[80px]"
        />
      </div>

      <div className="hidden md:flex flex-1 max-w-xs mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
            style={{ "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0d7a8c" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>

          {showLogout && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-2 hover:bg-slate-100 transition-colors text-sm"
                style={{ color: "#001f3f" }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
