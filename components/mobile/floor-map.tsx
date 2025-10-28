"use client"

import { useState, useEffect } from "react"
import { MapPin, Zap, Wrench, AlertTriangle, Wifi } from "lucide-react"

interface Asset {
  id: string
  name: string
  type: string
  category: string
  tagId: string
  status: "available" | "in-use" | "maintenance" | "lost"
  utilization: number
  lastActive: string
  department: string
  departmentId: string
  location: {
    building: string
    floor: string
    zone: string
    room: string
    coordinates: { x: number; y: number }
  }
  maintenanceReadiness: "green" | "yellow" | "red"
  lastSeen: string
  serialNumber: string
  value: number
}

interface FloorMapProps {
  assets: Asset[]
  selectedAsset: Asset | null
  onAssetSelect: (asset: Asset) => void
  floor: string
  building: string
}

export default function FloorMap({ assets, selectedAsset, onAssetSelect, floor, building }: FloorMapProps) {
  const [mapDimensions, setMapDimensions] = useState({ width: 400, height: 300 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [floor, building])

  // Generate coordinates for assets that don't have them
  const assetsWithCoordinates = assets.map((asset, index) => {
    if (asset.location?.coordinates?.x && asset.location?.coordinates?.y) {
      return asset
    }
    
    // Generate realistic coordinates based on asset ID/index
    const gridCols = 4
    const gridRows = 3
    const row = Math.floor(index / gridCols)
    const col = index % gridCols
    
    const roomWidth = 120
    const roomHeight = 80
    const margin = 20
    
    return {
      ...asset,
      location: {
        ...asset.location,
        coordinates: {
          x: margin + (col * (roomWidth + margin)) + Math.random() * (roomWidth - 40) + 20,
          y: margin + (row * (roomHeight + margin)) + Math.random() * (roomHeight - 40) + 20
        }
      }
    }
  })

  const getAssetIcon = (asset: Asset) => {
    switch (asset.status) {
      case "available":
        return <MapPin className="w-3 h-3 text-green-600" />
      case "in-use":
        return <Zap className="w-3 h-3 text-blue-600" />
      case "maintenance":
        return <Wrench className="w-3 h-3 text-orange-600" />
      case "lost":
        return <AlertTriangle className="w-3 h-3 text-red-600" />
      default:
        return <MapPin className="w-3 h-3 text-gray-600" />
    }
  }

  const getStatusColor = (asset: Asset) => {
    switch (asset.status) {
      case "available":
        return "bg-green-100 border-green-300"
      case "in-use":
        return "bg-blue-100 border-blue-300"
      case "maintenance":
        return "bg-orange-100 border-orange-300"
      case "lost":
        return "bg-red-100 border-red-300"
      default:
        return "bg-gray-100 border-gray-300"
    }
  }

  const getMaintenanceIndicator = (readiness: string) => {
    switch (readiness) {
      case "green":
        return "border-l-4 border-l-green-500"
      case "yellow":
        return "border-l-4 border-l-yellow-500"
      case "red":
        return "border-l-4 border-l-red-500"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-80 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading floor map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Map Header */}
      <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: "#001f3f" }}>{building} - {floor}</h3>
            <p className="text-sm text-gray-600">{assets.length} assets on this floor</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Wifi className="w-4 h-4" style={{ color: "#0d7a8c" }} />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Floor Plan */}
      <div className="relative bg-gradient-to-br from-blue-50/50 to-gray-100/50 h-80 overflow-hidden">
        {/* Grid Background */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Room Outlines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          {/* Mock room layouts */}
          <rect x="20" y="20" width="120" height="80" fill="rgba(255,255,255,0.7)" stroke="#d1d5db" strokeWidth="2" rx="4" />
          <rect x="160" y="20" width="120" height="80" fill="rgba(255,255,255,0.7)" stroke="#d1d5db" strokeWidth="2" rx="4" />
          <rect x="300" y="20" width="120" height="80" fill="rgba(255,255,255,0.7)" stroke="#d1d5db" strokeWidth="2" rx="4" />
          
          <rect x="20" y="120" width="120" height="80" fill="rgba(255,255,255,0.7)" stroke="#d1d5db" strokeWidth="2" rx="4" />
          <rect x="160" y="120" width="120" height="80" fill="rgba(255,255,255,0.7)" stroke="#d1d5db" strokeWidth="2" rx="4" />
          <rect x="300" y="120" width="120" height="80" fill="rgba(255,255,255,0.7)" stroke="#d1d5db" strokeWidth="2" rx="4" />
          
          <rect x="20" y="220" width="400" height="40" fill="rgba(239,246,255,0.7)" stroke="#3b82f6" strokeWidth="2" rx="4" />
          
          {/* Room Labels */}
          <text x="80" y="65" textAnchor="middle" className="fill-gray-600 text-xs font-medium">ICU-1</text>
          <text x="220" y="65" textAnchor="middle" className="fill-gray-600 text-xs font-medium">ICU-2</text>
          <text x="360" y="65" textAnchor="middle" className="fill-gray-600 text-xs font-medium">ICU-3</text>
          <text x="80" y="165" textAnchor="middle" className="fill-gray-600 text-xs font-medium">Ward A</text>
          <text x="220" y="165" textAnchor="middle" className="fill-gray-600 text-xs font-medium">Ward B</text>
          <text x="360" y="165" textAnchor="middle" className="fill-gray-600 text-xs font-medium">Storage</text>
          <text x="220" y="245" textAnchor="middle" className="fill-blue-600 text-xs font-medium">Corridor</text>
        </svg>

        {/* Asset Pins */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {assetsWithCoordinates.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAssetSelect(asset)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                selectedAsset?.id === asset.id 
                  ? 'scale-125 shadow-lg' 
                  : 'hover:scale-110 shadow-md hover:shadow-lg'
              }`}
              style={{
                left: `${Math.min(95, Math.max(5, (asset.location.coordinates.x / 450) * 100))}%`,
                top: `${Math.min(95, Math.max(5, (asset.location.coordinates.y / 320) * 100))}%`,
              }}
            >
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${getStatusColor(asset)} ${getMaintenanceIndicator(asset.maintenanceReadiness)}
                ${selectedAsset?.id === asset.id ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
              `}>
                {getAssetIcon(asset)}
              </div>
              
              {/* Pulse animation for selected asset */}
              {selectedAsset?.id === asset.id && (
                <div className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping"></div>
              )}
              
              {/* Asset name tooltip on hover */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {asset.name}
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20" style={{ zIndex: 4 }}>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3" style={{ color: "#001f3f" }}>Asset Status</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300 flex items-center justify-center shadow-sm">
                <MapPin className="w-2 h-2 text-green-600" />
              </div>
              <span className="text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center shadow-sm">
                <Zap className="w-2 h-2 text-blue-600" />
              </div>
              <span className="text-gray-700">In Use</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center shadow-sm">
                <Wrench className="w-2 h-2 text-orange-600" />
              </div>
              <span className="text-gray-700">Maintenance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
