"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { 
  MapPin, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Users, 
  Filter,
  Search,
  RefreshCw,
  Save,
  X,
  Target,
  Zap,
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { apiGet } from "@/lib/fetcher"
import { useDebounce } from "@/lib/hooks/useDebounce"

interface GeofenceZone {
  id: string
  name: string
  description?: string
  type: "restricted" | "authorized" | "high-security" | "maintenance-only"
  zoneIds: string[]
  assetIds: string[]
  priority: "low" | "medium" | "high" | "critical"
  active: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
  alertOnEntry: boolean
  alertOnExit: boolean
  allowedRoles: string[]
  workingHours?: {
    enabled: boolean
    startTime: string
    endTime: string
    daysOfWeek: number[]
  }
  coordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface GeofencingData {
  zones: GeofenceZone[]
  totalZones: number
  activeZones: number
  inactiveZones: number
}

import toast, { Toaster } from "react-hot-toast"

const FloorPlanMap = ({ 
  geofences, 
  selectedGeofence, 
  onGeofenceSelect,
  onGeofenceCreate,
  isCreating,
  setIsCreating
}: {
  geofences: GeofenceZone[]
  selectedGeofence: GeofenceZone | null
  onGeofenceSelect: (geofence: GeofenceZone | null) => void
  onGeofenceCreate: (coordinates: any) => void
  isCreating: boolean
  setIsCreating: (creating: boolean) => void
}) => {
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ x: number, y: number } | null>(null)

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isCreating) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setDragStart({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isCreating || !dragStart) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setDragEnd({ x, y })
  }

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isCreating || !dragStart || !dragEnd) return
    
    const width = Math.abs(dragEnd.x - dragStart.x)
    const height = Math.abs(dragEnd.y - dragStart.y)
    
    if (width > 20 && height > 20) { // Minimum size check
      onGeofenceCreate({
        x: Math.min(dragStart.x, dragEnd.x),
        y: Math.min(dragStart.y, dragEnd.y),
        width,
        height
      })
    }
    
    setDragStart(null)
    setDragEnd(null)
    setIsCreating(false)
  }

  const getGeofenceColor = (geofence: GeofenceZone) => {
    const colors = {
      'restricted': '#dc2626',
      'authorized': '#059669', 
      'high-security': '#7c2d12',
      'maintenance-only': '#d97706'
    }
    return colors[geofence.type] || '#6b7280'
  }

  const getGeofenceOpacity = (geofence: GeofenceZone) => {
    if (!geofence.active) return 0.3
    if (selectedGeofence?.id === geofence.id) return 0.8
    return 0.5
  }

  return (
    <div className="relative">
      {/* Floor Plan Background */}
      <div className="bg-gray-100 rounded-2xl border border-[#001f3f]/20 relative overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
          {/* Background Plan Image */}
          <img 
            src="/plan.png" 
            alt="Floor Plan"
            className="absolute inset-0 w-full h-full object-cover grayscale"
            style={{ filter: 'brightness(0.95) contrast(1.1) grayscale' }}
          />
          
          {/* Overlay for interactions */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]">
            <svg 
              width="100%" 
              height="100%" 
              className={`w-full h-full ${isCreating ? 'cursor-crosshair' : 'cursor-pointer'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              viewBox="0 0 800 450"
            >
              {/* Existing Geofences */}
              {geofences.map((geofence, idx) => (
                <g key={geofence.id}>
                  <rect
                    x={100 + (idx * 150)}
                    y={100 + (idx % 2) * 150}
                    width={120}
                    height={80}
                    fill={
                      geofence.type === 'restricted' ? 'rgba(239, 68, 68, 0.25)' :
                      geofence.type === 'authorized' ? 'rgba(13, 122, 140, 0.25)' :
                      geofence.type === 'high-security' ? 'rgba(249, 115, 22, 0.25)' :
                      'rgba(0, 31, 63, 0.25)'
                    }
                    stroke={
                      geofence.type === 'restricted' ? '#ef4444' :
                      geofence.type === 'authorized' ? '#0d7a8c' :
                      geofence.type === 'high-security' ? '#f97316' :
                      '#001f3f'
                    }
                    strokeWidth="2"
                    strokeDasharray={geofence.active ? "0" : "5,5"}
                    className={`cursor-pointer hover:opacity-75 transition-opacity duration-200 ${
                      selectedGeofence?.id === geofence.id ? 'opacity-90' : 'opacity-60'
                    }`}
                    onClick={() => onGeofenceSelect(geofence)}
                  />
                  <text 
                    x={160 + (idx * 150)}
                    y={145 + (idx % 2) * 150}
                    textAnchor="middle"
                    className="text-xs font-medium fill-[#001f3f] pointer-events-none drop-shadow-sm"
                  >
                    {geofence.name}
                  </text>
                  {/* Priority indicator */}
                  <circle
                    cx={210 + (idx * 150)}
                    cy={110 + (idx % 2) * 150}
                    r="4"
                    fill={
                      geofence.priority === 'critical' ? '#dc2626' :
                      geofence.priority === 'high' ? '#ea580c' :
                      geofence.priority === 'medium' ? '#d97706' :
                      '#0d7a8c'
                    }
                    stroke="white"
                    strokeWidth="1"
                    className="drop-shadow-sm"
                  />
                </g>
              ))}

              {/* Drawing Preview */}
              {isCreating && dragStart && dragEnd && (
                <rect
                  x={Math.min(dragStart.x, dragEnd.x)}
                  y={Math.min(dragStart.y, dragEnd.y)}
                  width={Math.abs(dragEnd.x - dragStart.x)}
                  height={Math.abs(dragEnd.y - dragStart.y)}
                  fill="rgba(13, 122, 140, 0.3)"
                  stroke="#0d7a8c"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-4 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-[#001f3f]/10">
        <h4 className="font-medium text-[#001f3f] mb-3">Geofence Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Restricted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#0d7a8c] rounded"></div>
            <span className="text-xs text-gray-600">Authorized</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-xs text-gray-600">High Security</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#001f3f] rounded"></div>
            <span className="text-xs text-gray-600">Maintenance Only</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const GeofenceForm = ({ 
  geofence, 
  onSave, 
  onCancel,
  coordinates 
}: { 
  geofence?: GeofenceZone | null
  onSave: (data: any) => void
  onCancel: () => void
  coordinates?: any
}) => {
  const [formData, setFormData] = useState({
    name: geofence?.name || '',
    description: geofence?.description || '',
    type: geofence?.type || 'authorized',
    priority: geofence?.priority || 'medium',
    alertOnEntry: geofence?.alertOnEntry || false,
    alertOnExit: geofence?.alertOnExit || false,
    allowedRoles: geofence?.allowedRoles || [],
    workingHours: geofence?.workingHours || {
      enabled: false,
      startTime: '08:00',
      endTime: '18:00',
      daysOfWeek: [1, 2, 3, 4, 5]
    }
  })

  const roles = ['biomedical', 'nursing', 'admin', 'security', 'maintenance']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      coordinates,
      active: true
    })
  }

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(role)
        ? prev.allowedRoles.filter(r => r !== role)
        : [...prev.allowedRoles, role]
    }))
  }

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        daysOfWeek: prev.workingHours.daysOfWeek.includes(dayIndex)
          ? prev.workingHours.daysOfWeek.filter(d => d !== dayIndex)
          : [...prev.workingHours.daysOfWeek, dayIndex]
      }
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {geofence ? 'Edit Geofence Zone' : 'Create New Geofence Zone'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter zone name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="authorized">Authorized</option>
              <option value="restricted">Restricted</option>
              <option value="high-security">High Security</option>
              <option value="maintenance-only">Maintenance Only</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter zone description"
          />
        </div>

        {/* Priority and Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="alertOnEntry"
              checked={formData.alertOnEntry}
              onChange={(e) => setFormData(prev => ({ ...prev, alertOnEntry: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="alertOnEntry" className="text-sm font-medium text-gray-700">
              Alert on Entry
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="alertOnExit"
              checked={formData.alertOnExit}
              onChange={(e) => setFormData(prev => ({ ...prev, alertOnExit: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="alertOnExit" className="text-sm font-medium text-gray-700">
              Alert on Exit
            </label>
          </div>
        </div>

        {/* Allowed Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Roles
          </label>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  formData.allowedRoles.includes(role)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="workingHoursEnabled"
              checked={formData.workingHours.enabled}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, enabled: e.target.checked }
              }))}
              className="mr-2"
            />
            <label htmlFor="workingHoursEnabled" className="text-sm font-medium text-gray-700">
              Restrict to Working Hours
            </label>
          </div>
          
          {formData.workingHours.enabled && (
            <div className="pl-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.workingHours.startTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, startTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.workingHours.endTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, endTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Week
                </label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.workingHours.daysOfWeek.includes(index)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {geofence ? 'Update Zone' : 'Create Zone'}
          </button>
        </div>
      </form>
    </div>
  )
}

function GeofencingContent() {
  const [data, setData] = useState<GeofencingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGeofence, setSelectedGeofence] = useState<GeofenceZone | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createCoordinates, setCreateCoordinates] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Debounce search term to reduce filtering operations
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiGet('/api/asset-protection/geofencing')
      setData(response as GeofencingData)
    } catch (error) {
      console.error('Failed to load geofencing data:', error)
      toast.error('Failed to load geofencing data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCancelled = false
    
    const fetchData = async () => {
      try {
        const response = await apiGet('/api/asset-protection/geofencing')
        if (!isCancelled) {
          setData(response as GeofencingData)
          setLoading(false)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load geofencing data:', error)
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [])

  // Memoize filtered results to prevent unnecessary recalculations
  const filteredGeofences = useMemo(() => {
    if (!data?.zones) return []
    
    return data.zones.filter(zone => {
      const matchesSearch = zone.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           zone.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesType = filterType === 'all' || zone.type === filterType
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && zone.active) ||
                           (filterStatus === 'inactive' && !zone.active)
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [data?.zones, debouncedSearchTerm, filterType, filterStatus])

  const handleGeofenceCreate = useCallback((coordinates: any) => {
    setCreateCoordinates(coordinates)
    setShowForm(true)
    setSelectedGeofence(null)
  }, [])

  const handleGeofenceSave = useCallback(async (formData: any) => {
    try {
      // In a real app, this would make an API call
      toast.success('Geofence zone saved successfully')
      
      // Notify biomedical leaders about critical/high security zones
      if (formData.type === 'high-security' || formData.priority === 'critical') {
        setTimeout(() => {
          toast.success('Biomedical leaders notified about new security zone', {
            icon: '📧',
            duration: 4000,
            style: {
              background: '#DCFCE7',
              border: '1px solid #BBF7D0',
              color: '#166534'
            }
          })
        }, 1500)
      }
      
      setShowForm(false)
      setCreateCoordinates(null)
      setSelectedGeofence(null)
      loadData()
    } catch (error) {
      toast.error('Failed to save geofence zone')
    }
  }, [loadData])

  const handleGeofenceDelete = async (geofence: GeofenceZone) => {
    if (!confirm(`Are you sure you want to delete "${geofence.name}"?`)) return
    
    try {
      // In a real app, this would make an API call
      toast.success('Geofence zone deleted successfully')
      
      // Notify biomedical leaders about security zone changes
      if (geofence.type === 'high-security' || geofence.priority === 'critical') {
        setTimeout(() => {
          toast.success('Biomedical leaders notified about security zone removal', {
            icon: '📧',
            duration: 4000,
            style: {
              background: '#DCFCE7',
              border: '1px solid #BBF7D0',
              color: '#166534'
            }
          })
        }, 1500)
      }
      
      setSelectedGeofence(null)
      loadData()
    } catch (error) {
      toast.error('Failed to delete geofence zone')
    }
  }

  const handleGeofenceToggle = async (geofence: GeofenceZone) => {
    try {
      // In a real app, this would make an API call
      const action = geofence.active ? 'disabled' : 'enabled'
      toast.success(`Geofence zone ${action}`)
      
      // Notify biomedical leaders about critical security zone changes
      if (geofence.type === 'high-security' || geofence.priority === 'critical') {
        setTimeout(() => {
          toast.success(`Biomedical leaders notified: Security zone ${action}`, {
            icon: '📧',
            duration: 4000,
            style: {
              background: '#DCFCE7',
              border: '1px solid #BBF7D0',
              color: '#166534'
            }
          })
        }, 1500)
      }
      
      loadData()
    } catch (error) {
      toast.error('Failed to update geofence zone')
    }
  }

  const handleGeofenceClick = (geofence: GeofenceZone) => {
    setSelectedGeofence(geofence)
    
    // Show geofence details
    toast(`Viewing ${geofence.name} - ${geofence.assetIds.length} assets protected`, {
      icon: 'ℹ️',
      duration: 3000
    })
    
    // Notify if high-risk zone
    if (geofence.type === 'high-security' || geofence.priority === 'critical') {
      setTimeout(() => {
        toast.error(`HIGH SECURITY ZONE: ${geofence.name} requires special authorization`, {
          icon: '🔒',
          duration: 5000,
          style: {
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            color: '#92400E'
          }
        })
      }, 1000)
    }
  }

  if (loading) {
    return (
      <div className="p-8 bg-[#f8fafc] min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#001f3f]/10 rounded-2xl w-64"></div>
          <div className="h-96 bg-white/50 backdrop-blur-sm rounded-3xl border border-[#001f3f]/10"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-[#f8fafc] min-h-screen">
      <Toaster />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-[#001f3f] flex items-center gap-3">
            <Target className="w-8 h-8 text-[#0d7a8c]" />
            Geofencing Management
          </h1>
          <p className="text-gray-600 mt-2 font-light">
            Configure virtual boundaries to protect high-value assets
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsCreating(true)
              toast.success('Click and drag on the map to create a new geofence', { 
                icon: '🎯',
                duration: 4000 
              })
            }}
            disabled={isCreating}
            className="px-4 py-2 bg-[#0d7a8c] text-white rounded-2xl hover:bg-[#003d5c] disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Click & Drag on Map' : 'Create Geofence'}
          </button>
          
          <button
            onClick={() => {
              loadData()
              toast.success('Geofence data refreshed', { icon: '🔄', duration: 2000 })
            }}
            className="px-4 py-2 bg-white border border-[#0d7a8c]/20 text-[#0d7a8c] rounded-2xl hover:bg-[#0d7a8c]/5 flex items-center gap-2 transition-all duration-200 hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          {isCreating && (
            <button
              onClick={() => {
                setIsCreating(false)
                toast('Geofence creation cancelled', { icon: 'ℹ️', duration: 2000 })
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 flex items-center gap-2 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/50 border border-[#001f3f]/10 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#001f3f]" />
            <div>
              <p className="text-sm font-light text-gray-600">Total Zones</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{data?.totalZones || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 border border-[#0d7a8c]/10 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-[#0d7a8c]" />
            <div>
              <p className="text-sm font-light text-gray-600">Active Zones</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{data?.activeZones || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 border border-yellow-500/10 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <EyeOff className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm font-light text-gray-600">Inactive Zones</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{data?.inactiveZones || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 border border-red-500/10 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-sm font-light text-gray-600">High Priority</p>
              <p className="text-2xl font-semibold text-[#001f3f]">
                {filteredGeofences.filter(z => z.priority === 'high' || z.priority === 'critical').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-[#001f3f]/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light text-[#001f3f]">Floor Plan & Geofences</h3>
              {isCreating && (
                <p className="text-sm text-[#0d7a8c] font-light">
                  Click and drag to create a new geofence zone
                </p>
              )}
            </div>
            
            <FloorPlanMap
              geofences={filteredGeofences}
              selectedGeofence={selectedGeofence}
              onGeofenceSelect={setSelectedGeofence}
              onGeofenceCreate={handleGeofenceCreate}
              isCreating={isCreating}
              setIsCreating={setIsCreating}
            />
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-[#001f3f]/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light text-[#001f3f]">Filters</h3>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setFilterStatus('all')
                  toast.success('Filters cleared', { icon: '🔄', duration: 2000 })
                }}
                className="text-xs px-3 py-1 text-gray-600 hover:text-[#0d7a8c] hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search zones..."
                    className="w-full pl-10 pr-3 py-2 border border-[#001f3f]/20 rounded-2xl focus:ring-2 focus:ring-[#0d7a8c] bg-white/70 backdrop-blur-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-[#001f3f]/20 rounded-2xl focus:ring-2 focus:ring-[#0d7a8c] bg-white/70 backdrop-blur-sm"
                >
                  <option value="all">All Types</option>
                  <option value="authorized">Authorized</option>
                  <option value="restricted">Restricted</option>
                  <option value="high-security">High Security</option>
                  <option value="maintenance-only">Maintenance Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-[#001f3f]/20 rounded-2xl focus:ring-2 focus:ring-[#0d7a8c] bg-white/70 backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Geofence List */}
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-[#001f3f]/10 p-6 shadow-sm">
            <h3 className="text-lg font-light text-[#001f3f] mb-4">
              Geofence Zones ({filteredGeofences.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredGeofences.map((geofence) => (
                <div
                  key={geofence.id}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 backdrop-blur-sm transform hover:-translate-y-0.5 hover:shadow-lg ${
                    selectedGeofence?.id === geofence.id
                      ? 'border-[#0d7a8c]/30 bg-[#0d7a8c]/5 shadow-md'
                      : 'border-[#001f3f]/10 hover:border-[#0d7a8c]/30 hover:bg-white/80'
                  }`}
                  onClick={() => handleGeofenceClick(geofence)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-[#001f3f] text-sm hover:text-[#0d7a8c] transition-colors">
                          {geofence.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          geofence.type === 'restricted' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                          geofence.type === 'high-security' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                          geofence.type === 'maintenance-only' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                          'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}>
                          {geofence.type.replace('-', ' ')}
                        </span>
                        {!geofence.active && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                        {(geofence.type === 'high-security' || geofence.priority === 'critical') && (
                          <span className="animate-pulse text-red-500 text-xs">●</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2 hover:text-gray-800 transition-colors">
                        {geofence.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span className={`flex items-center gap-1 ${
                          geofence.priority === 'critical' ? 'text-red-600' :
                          geofence.priority === 'high' ? 'text-orange-600' :
                          geofence.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            geofence.priority === 'critical' ? 'bg-red-600' :
                            geofence.priority === 'high' ? 'bg-orange-600' :
                            geofence.priority === 'medium' ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}></div>
                          {geofence.priority}
                        </span>
                        <span className="hover:text-gray-700 transition-colors">
                          {geofence.assetIds.length} assets
                        </span>
                        <span className="text-gray-400">
                          {geofence.zoneIds.length} zones
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          className="text-xs px-2 py-1 bg-[#0d7a8c] text-white rounded-lg hover:bg-[#003d5c] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.success(`Viewing details for ${geofence.name}`, { 
                              icon: 'ℹ️',
                              duration: 3000 
                            })
                          }}
                        >
                          View Details
                        </button>
                        <button 
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast(`Managing ${geofence.assetIds.length} assets in ${geofence.name}`, { 
                              icon: '🔧',
                              duration: 3000 
                            })
                          }}
                        >
                          Manage Assets
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGeofenceToggle(geofence)
                        }}
                        className={`p-1 rounded ${
                          geofence.active 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={geofence.active ? 'Disable' : 'Enable'}
                      >
                        {geofence.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedGeofence(geofence)
                          setShowForm(true)
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGeofenceDelete(geofence)
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredGeofences.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="font-medium">No geofence zones found</p>
                  <p className="text-sm">Try adjusting your filters or create a new zone</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <GeofenceForm
              geofence={selectedGeofence}
              coordinates={createCoordinates}
              onSave={handleGeofenceSave}
              onCancel={() => {
                setShowForm(false)
                setCreateCoordinates(null)
                setSelectedGeofence(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(GeofencingContent)