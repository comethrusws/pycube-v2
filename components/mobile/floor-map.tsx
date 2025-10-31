
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

const getAssetCoordinates = (asset: Asset, assets: Asset[], mapDetails: { width: number, height: number, x: number, y: number }) => {
  const padding = 50;
  const minX = Math.min(...assets.map(a => a.location.coordinates.x));
  const minY = Math.min(...assets.map(a => a.location.coordinates.y));
  const maxX = Math.max(...assets.map(a => a.location.coordinates.x));
  const maxY = Math.max(...assets.map(a => a.location.coordinates.y));

  const boundingBoxWidth = maxX - minX;
  const boundingBoxHeight = maxY - minY;

  const scaleX = (mapDetails.width - padding * 2) / boundingBoxWidth;
  const scaleY = (mapDetails.height - padding * 2) / boundingBoxHeight;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (mapDetails.width - boundingBoxWidth * scale) / 2 - minX * scale + mapDetails.x;
  const offsetY = (mapDetails.height - boundingBoxHeight * scale) / 4 - minY * scale + mapDetails.y;

  const x = asset.location.coordinates.x * scale + offsetX;
  const y = asset.location.coordinates.y * scale + offsetY;

  return { x, y };
}

export default function FloorMap({ assets, selectedAsset, onAssetSelect, floor, building }: FloorMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null)
  const [mapRenderDetails, setMapRenderDetails] = useState({ width: 0, height: 0, x: 0, y: 0 })

  const getPinColor = useCallback((status: Asset["status"]) => {
    switch (status) {
      case "available":
        return "#10B981"
      case "in-use":
        return "#3B82F6"
      case "maintenance":
        return "#F59E0B"
      case "lost":
        return "#EF4444"
      default:
        return "#6B7280"
    }
  }, [])

  useEffect(() => {
    const img = new Image()
    img.src = "/plan.png"
    img.onload = () => {
      setMapImage(img)
      setIsLoading(false)
    }
    img.onerror = () => {
      console.error("Failed to load map image.")
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!mapImage) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width
    canvas.height = height

    const imageAspectRatio = mapImage.width / mapImage.height;
    const canvasAspectRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let imageX = 0;
    let imageY = 0;

    if (imageAspectRatio > canvasAspectRatio) {
      drawHeight = width / imageAspectRatio;
      imageY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imageAspectRatio;
      imageX = (width - drawWidth) / 2;
    }

    ctx.drawImage(mapImage, imageX, imageY, drawWidth, drawHeight);
    setMapRenderDetails({ width: drawWidth, height: drawHeight, x: imageX, y: imageY });

    assets.forEach(asset => {
      if (asset.location?.coordinates?.x && asset.location?.coordinates?.y) {
        const { x: assetX, y: assetY } = getAssetCoordinates(asset, assets, { width: drawWidth, height: drawHeight, x: imageX, y: imageY });

        ctx.beginPath()
        ctx.arc(assetX, assetY, 8, 0, 2 * Math.PI)
        ctx.fillStyle = getPinColor(asset.status)
        ctx.fill()
        ctx.strokeStyle = "white"
        ctx.lineWidth = 2
        ctx.stroke()

        if (selectedAsset?.id === asset.id) {
          ctx.beginPath()
          ctx.arc(assetX, assetY, 12, 0, 2 * Math.PI)
          ctx.strokeStyle = "#0d7a8c"
          ctx.lineWidth = 3
          ctx.stroke()
        }
      }
    })
  }, [assets, selectedAsset, mapImage, getPinColor])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const clickedAsset = assets.find(asset => {
      if (asset.location?.coordinates?.x && asset.location?.coordinates?.y) {
        const { x: assetX, y: assetY } = getAssetCoordinates(asset, assets, mapRenderDetails);
        const distance = Math.sqrt(Math.pow(x - assetX, 2) + Math.pow(y - assetY, 2))
        return distance < 10
      }
      return false
    })

    if (clickedAsset) {
      onAssetSelect(clickedAsset)
    }
  }

  const handleCanvasTouch = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.touches[0].clientX - rect.left
    const y = event.touches[0].clientY - rect.top

    const clickedAsset = assets.find(asset => {
      if (asset.location?.coordinates?.x && asset.location?.coordinates?.y) {
        const { x: assetX, y: assetY } = getAssetCoordinates(asset, assets, mapRenderDetails);
        const distance = Math.sqrt(Math.pow(x - assetX, 2) + Math.pow(y - assetY, 2))
        return distance < 10
      }
      return false
    })

    if (clickedAsset) {
      onAssetSelect(clickedAsset)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading floor map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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

      <div className="relative h-96 lg:h-[480px] bg-gray-100">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasTouch}
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3" style={{ color: "#001f3f" }}>Asset Status</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#10B981] border border-green-300"></div>
              <span className="text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6] border border-blue-300"></div>
              <span className="text-gray-700">In Use</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B] border border-orange-300"></div>
              <span className="text-gray-700">Maintenance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#EF4444] border border-red-300"></div>
              <span className="text-gray-700">Last Seen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
