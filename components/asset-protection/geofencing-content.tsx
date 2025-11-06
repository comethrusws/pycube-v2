"use client"

import { useState, useEffect } from "react"
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

import toast from "react-hot-toast"

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
      <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden">
        <svg 
          width="800" 
          height="600" 
          className={`w-full h-auto ${isCreating ? 'cursor-crosshair' : 'cursor-pointer'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Floor Plan Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Mock Room Layouts */}
          <rect x="50" y="50" width="150" height="100" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <text x="125" y="105" textAnchor="middle" className="text-xs fill-gray-600">ICU Ward</text>
          
          <rect x="220" y="50" width="120" height="80" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <text x="280" y="95" textAnchor="middle" className="text-xs fill-gray-600">OR 1</text>
          
          <rect x="360" y="50" width="120" height="80" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <text x="420" y="95" textAnchor="middle" className="text-xs fill-gray-600">OR 2</text>
          
          <rect x="50" y="170" width="180" height="120" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <text x="140" y="235" textAnchor="middle" className="text-xs fill-gray-600">Emergency Dept</text>
          
          <rect x="250" y="170" width="100" height="120" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <text x="300" y="235" textAnchor="middle" className="text-xs fill-gray-600">Pharmacy</text>
          
          <rect x="370" y="170" width="150" height="120" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <text x="445" y="235" textAnchor="middle" className="text-xs fill-gray-600">Radiology</text>
          
          <rect x="50" y="310" width="200" height="100" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <text x="150" y="365" textAnchor="middle" className="text-xs fill-gray-600">Patient Rooms</text>
          
          <rect x="270" y="310" width="250" height="100" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <text x="395" y="365" textAnchor="middle" className="text-xs fill-gray-600">Laboratory</text>

          {/* Existing Geofences */}
          {geofences.map((geofence) => (
            geofence.coordinates && (
              <g key={geofence.id}>
                <rect
                  x={geofence.coordinates.x}
                  y={geofence.coordinates.y}
                  width={geofence.coordinates.width}
                  height={geofence.coordinates.height}
                  fill={getGeofenceColor(geofence)}
                  fillOpacity={getGeofenceOpacity(geofence)}
                  stroke={getGeofenceColor(geofence)}
                  strokeWidth="2"
                  strokeDasharray={geofence.active ? "0" : "5,5"}
                  className="cursor-pointer hover:fill-opacity-70"
                  onClick={() => onGeofenceSelect(geofence)}
                />
                <text 
                  x={geofence.coordinates.x + geofence.coordinates.width / 2}
                  y={geofence.coordinates.y + 15}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium pointer-events-none"
                >
                  {geofence.name}
                </text>
                {/* Priority indicator */}
                <circle
                  cx={geofence.coordinates.x + geofence.coordinates.width - 10}
                  cy={geofence.coordinates.y + 10}
                  r="5"
                  fill={
                    geofence.priority === 'critical' ? '#dc2626' :
                    geofence.priority === 'high' ? '#ea580c' :
                    geofence.priority === 'medium' ? '#d97706' :
                    '#65a30d'
                  }
                />
              </g>
            )
          ))}

          {/* Drawing Preview */}
          {isCreating && dragStart && dragEnd && (
            <rect
              x={Math.min(dragStart.x, dragEnd.x)}
              y={Math.min(dragStart.y, dragEnd.y)}
              width={Math.abs(dragEnd.x - dragStart.x)}
              height={Math.abs(dragEnd.y - dragStart.y)}
              fill="rgba(59, 130, 246, 0.3)"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>
      </div>

      {/* Map Legend */}
      <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Geofence Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-xs text-gray-600">Restricted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-xs text-gray-600">Authorized</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-800 rounded"></div>
            <span className="text-xs text-gray-600">High Security</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-600 rounded"></div>
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

export default function GeofencingContent() {
  const [data, setData] = useState<GeofencingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGeofence, setSelectedGeofence] = useState<GeofenceZone | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createCoordinates, setCreateCoordinates] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const loadData = async () => {
    try {
      const response = await apiGet('/api/asset-protection/geofencing')
      setData(response as GeofencingData)
    } catch (error) {
      console.error('Failed to load geofencing data:', error)
      toast.error('Failed to load geofencing data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredGeofences = data?.zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || zone.type === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && zone.active) ||
                         (filterStatus === 'inactive' && !zone.active)
    
    return matchesSearch && matchesType && matchesStatus
  }) || []

  const handleGeofenceCreate = (coordinates: any) => {
    setCreateCoordinates(coordinates)
    setShowForm(true)
    setSelectedGeofence(null)
  }

  const handleGeofenceSave = async (formData: any) => {
    try {
      // In a real app, this would make an API call
      toast.success('Geofence zone saved successfully')
      setShowForm(false)
      setCreateCoordinates(null)
      setSelectedGeofence(null)
      loadData()
    } catch (error) {
      toast.error('Failed to save geofence zone')
    }
  }

  const handleGeofenceDelete = async (geofence: GeofenceZone) => {
    if (!confirm(`Are you sure you want to delete "${geofence.name}"?`)) return
    
    try {
      // In a real app, this would make an API call
      toast.success('Geofence zone deleted successfully')
      setSelectedGeofence(null)
      loadData()
    } catch (error) {
      toast.error('Failed to delete geofence zone')
    }
  }

  const handleGeofenceToggle = async (geofence: GeofenceZone) => {
    try {
      // In a real app, this would make an API call
      toast.success(`Geofence zone ${geofence.active ? 'disabled' : 'enabled'}`)
      loadData()
    } catch (error) {
      toast.error('Failed to update geofence zone')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            Geofencing Management
          </h1>
          <p className="text-gray-600 mt-2">
            Configure virtual boundaries to protect high-value assets
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Click & Drag on Map' : 'Create Geofence'}
          </button>
          
          {isCreating && (
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">{data?.totalZones || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900">{data?.activeZones || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <EyeOff className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Zones</p>
              <p className="text-2xl font-bold text-gray-900">{data?.inactiveZones || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
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
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Floor Plan & Geofences</h3>
              {isCreating && (
                <p className="text-sm text-blue-600 font-medium">
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
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Geofence List */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Geofence Zones ({filteredGeofences.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredGeofences.map((geofence) => (
                <div
                  key={geofence.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedGeofence?.id === geofence.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedGeofence(geofence)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{geofence.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          geofence.type === 'restricted' ? 'bg-red-100 text-red-800' :
                          geofence.type === 'high-security' ? 'bg-amber-100 text-amber-800' :
                          geofence.type === 'maintenance-only' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {geofence.type.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {geofence.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
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
                        <span>{geofence.assetIds.length} assets</span>
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