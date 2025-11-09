"use client"

import type React from "react"
import {
  X,
  Search,
  Home,
  Package,
  List,
  Database,
  MapPin,
  Wrench,
  Building2,
  Shield,
  Warehouse,
  ChevronRight,
  ListCheckIcon,
  MapPinPlus,
  Share2,
} from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
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
      { icon: Home, label: "Dashboard", href: "/dashboard" },
    ] as MenuItem[],
  },
  {
    items: [
      {
        icon: Shield,
        label: "Asset Protection",
        href: "/asset-protection",
        submenu: [
          { label: "Geofencing", href: "/asset-protection/geofencing" },
          { label: "Movement Logs", href: "/asset-protection/movement-logs" },
        ],
      },
    ] as MenuItem[],
  },

  {
    items: [
      {
        icon: MapPin,
        label: "Asset Utilization",
        href: "/asset-utilization",
        submenu: [
          { label: "Location Lists", href: "/asset-utilization/location-lists" }
        ],
      },
    ] as MenuItem[],
  },
  {
    items: [
      {
        icon: MapPinPlus,
        label: "Asset Search & Retrieval",
        href: "/mobile/asset-search",
      },
    ] as MenuItem[],
  },
  {
    items: [
      {
        icon: ListCheckIcon,
        label: "Compliance & Risk",
        href: "/compliance",
        submenu: [
          { label: "Reports", href: "/compliance/reports" },
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
        href: "/space-management",
        submenu: [
          { label: "Buildings", href: "/space-management/buildings" },
          { label: "Floors", href: "/space-management/floors" },
          { label: "Zones", href: "/space-management/zones" },
          { label: "Readers", href: "/space-management/readers" },
        ],
      },
    ] as MenuItem[],
  },
  {
    items: [
      { icon: Warehouse, label: "Facilities", href: "/facilities" },
    ] as MenuItem[],
  },

  {
    items: [
      { icon: Package, label: "Product Categories", href: "/product-categories" },
      { icon: List, label: "Products", href: "/products" },
      { icon: Database, label: "Assets", href: "/assets" },
      { icon: Share2, label: "Integrations", href: "/system-integrations" },
    ] as MenuItem[],
  },

]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Auto-expand items based on current path
  useEffect(() => {
    const currentSection = menuSections.find(section => 
      section.items.some(item => 
        item.href === pathname || 
        (item.submenu && item.submenu.some(sub => sub.href === pathname))
      )
    )
    
    if (currentSection) {
      const activeItem = currentSection.items.find(item => 
        item.href === pathname || 
        (item.submenu && item.submenu.some(sub => sub.href === pathname))
      )
      
      if (activeItem && activeItem.submenu && !expandedItems.includes(activeItem.label)) {
        setExpandedItems(prev => [...prev, activeItem.label])
      }
    }
  }, [pathname])

  const handleMenuItemClick = useCallback((item: MenuItem, e: React.MouseEvent) => {
    if (item.submenu && item.submenu.length > 0) {
      // Auto-expand the submenu when navigating to the main page
      setExpandedItems((prev) => 
        prev.includes(item.label) ? prev : [...prev, item.label]
      )
    }
  }, [])

  const toggleSubmenu = useCallback((label: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }, [])

  const isItemActive = useCallback((item: MenuItem): boolean => {
    if (item.href === pathname) return true
    if (item.submenu) {
      return item.submenu.some((sub) => sub.href === pathname)
    }
    return false
  }, [pathname])

  // Memoize filtered menu sections to avoid recalculation on every render
  const filteredMenuSections = useMemo(() => {
    if (!searchQuery.trim()) return menuSections
    
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.submenu && item.submenu.some(sub => 
          sub.label.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    })).filter(section => section.items.length > 0)
  }, [searchQuery])

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
            {filteredMenuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isItemActive(item)
                  const isExpanded = expandedItems.includes(item.label)

                  return (
                    <div key={item.label}>
                      {'submenu' in item && item.submenu ? (
                        <Link href={item.href}>
                          <button
                            onClick={(e) => handleMenuItemClick(item, e)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-xs text-left"
                            style={{
                              backgroundColor: active ? "#0d7a8c" : "transparent",
                              color: "white",
                            }}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 font-light">{item.label}</span>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                        </Link>
                      ) : (
                        <Link href={item.href}>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-xs text-left"
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
                                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-xs text-left"
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

                {sectionIndex < filteredMenuSections.length - 1 && (
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
