"use client"

import type React from "react"
import {
  X,
  Search,
  Home,
  Settings,
  Zap,
  Bot,
  Package,
  List,
  Database,
  MapPin,
  Wrench,
  Building2,
  Shield,
  Warehouse,
  Users,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface MenuItem {
  icon: React.ComponentType<any>
  label: string
  href: string
  submenu?: { label: string; href: string }[]
}

const menuSections = [
  {
    items: [
      { icon: Home, label: "Homepage", href: "/dashboard" },
      { icon: Settings, label: "Implementation", href: "/dashboard/implementation" },
      { icon: Zap, label: "App Settings", href: "/dashboard/settings" },
      { icon: Bot, label: "AI Assistant", href: "/dashboard/ai-assistant" },
    ] as MenuItem[],
  },
  {
    items: [
      { icon: Package, label: "Product Categories", href: "/dashboard/categories" },
      { icon: List, label: "Products", href: "/dashboard/products" },
      { icon: Database, label: "Assets", href: "/dashboard/assets" },
    ] as MenuItem[],
  },
  {
    items: [
      {
        icon: MapPin,
        label: "Asset Locator",
        href: "/asset-locator",
        submenu: [
          { label: "Dashboard", href: "/asset-locator" },
          { label: "Location Lists", href: "/asset-locator" },
        ],
      },
    ] as MenuItem[],
  },
  {
    items: [
      {
        icon: Wrench,
        label: "Preventative Maintenance",
        href: "/preventative-maintenance",
        submenu: [
          { label: "Dashboard", href: "/preventative-maintenance" },
          { label: "Maintenance Requests", href: "/preventative-maintenance/requests" },
        ],
      },
    ] as MenuItem[],
  },
  {
    items: [
      {
        icon: Building2,
        label: "Space Management",
        href: "/dashboard/space",
        submenu: [
          { label: "Asset Tracking", href: "/dashboard/space/tracking" },
          { label: "Buildings", href: "/dashboard/space/buildings" },
          { label: "Floors", href: "/dashboard/space/floors" },
          { label: "Zones", href: "/dashboard/space/zones" },
          { label: "Roofers", href: "/dashboard/space/roofers" },
        ],
      },
    ] as MenuItem[],
  },
  {
    items: [
      {
        icon: Shield,
        label: "Asset Protection",
        href: "/dashboard/protection",
        submenu: [
          { label: "Dashboard", href: "/dashboard/protection" },
          { label: "Assets", href: "/dashboard/protection/assets" },
        ],
      },
    ] as MenuItem[],
  },
  {
    items: [
      { icon: Warehouse, label: "Facilities", href: "/dashboard/facilities" },
      { icon: Users, label: "Departments", href: "/dashboard/departments" },
    ] as MenuItem[],
  },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Asset Locator"])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSubmenu = (label: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href === pathname) return true
    if (item.submenu) {
      return item.submenu.some((sub) => sub.href === pathname)
    }
    return false
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={onToggle} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 text-white transform transition-transform duration-300 z-40 lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ backgroundColor: "#003d5c" }}
      >
        <div className="h-full flex flex-col">
          <div className="lg:hidden p-4 flex justify-end">
            <button onClick={onToggle} className="p-2 rounded-lg transition-colors" style={{ color: "white" }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: "#0d7a8c" }}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2"
                style={{ backgroundColor: "#001f3f", "--tw-ring-color": "#0d7a8c" } as React.CSSProperties}
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isItemActive(item)
                  const isExpanded = expandedItems.includes(item.label)

                  return (
                    <div key={item.label}>
                      {'submenu' in item && item.submenu ? (
                        <button
                          onClick={(e) => toggleSubmenu(item.label, e)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm text-left"
                          style={{
                            backgroundColor: active ? "#0d7a8c" : "transparent",
                            color: "white",
                          }}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="flex-1 font-light">{item.label}</span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </button>
                      ) : (
                        <Link href={item.href}>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm text-left"
                            style={{
                              backgroundColor: active ? "#0d7a8c" : "transparent",
                              color: "white",
                            }}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 font-light">{item.label}</span>
                          </button>
                        </Link>
                      )}

                      {'submenu' in item && item.submenu && isExpanded && (
                        <div className="ml-4 space-y-1 mt-1">
                          {item.submenu.map((subitem) => {
                            const subActive = pathname === subitem.href
                            return (
                              <Link key={subitem.label} href={subitem.href}>
                                <button
                                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm text-left"
                                  style={{
                                    backgroundColor: subActive ? "#0d7a8c" : "transparent",
                                    color: "white",
                                  }}
                                >
                                  <div
                                    className="w-1 h-1 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: "#0d7a8c" }}
                                  ></div>
                                  <span className="font-light">{subitem.label}</span>
                                </button>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {sectionIndex < menuSections.length - 1 && (
                  <div className="my-2" style={{ borderTop: "1px solid rgba(13, 122, 140, 0.3)" }}></div>
                )}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t text-xs text-white/60 text-center" style={{ borderColor: "#001f3f" }}>
            <p>Copyright © 2025 Pycube™</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </aside>
    </>
  )
}
