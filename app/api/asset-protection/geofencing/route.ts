import { loadSeedData } from "@/lib/data-loader"
import { NextRequest, NextResponse } from "next/server"
import { GeofenceZone } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    
    // Generate geofence zones
    const geofenceZones: GeofenceZone[] = generateGeofenceZones(data)
    
    return NextResponse.json({
      zones: geofenceZones,
      totalZones: geofenceZones.length,
      activeZones: geofenceZones.filter(z => z.active).length,
      inactiveZones: geofenceZones.filter(z => !z.active).length
    })
  } catch (error) {
    console.error('Geofencing API error:', error)
    return NextResponse.json(
      { error: 'Failed to load geofencing data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, zoneIds, assetIds, priority, alertOnEntry, alertOnExit, allowedRoles, workingHours } = body
    
    // In a real app, this would save to database
    const newGeofence: GeofenceZone = {
      id: `geo-zone-${Date.now()}`,
      name,
      description,
      type,
      zoneIds: zoneIds || [],
      assetIds: assetIds || [],
      priority,
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user', // In real app, get from auth
      alertOnEntry: alertOnEntry || false,
      alertOnExit: alertOnExit || false,
      allowedRoles: allowedRoles || [],
      workingHours
    }
    
    return NextResponse.json({
      success: true,
      message: 'Geofence zone created successfully',
      zone: newGeofence
    })
  } catch (error) {
    console.error('Create geofence error:', error)
    return NextResponse.json(
      { error: 'Failed to create geofence zone' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    // In a real app, this would update in database
    const updatedGeofence = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user'
    }
    
    return NextResponse.json({
      success: true,
      message: 'Geofence zone updated successfully',
      zone: updatedGeofence
    })
  } catch (error) {
    console.error('Update geofence error:', error)
    return NextResponse.json(
      { error: 'Failed to update geofence zone' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Geofence zone ID is required' },
        { status: 400 }
      )
    }
    
    // In a real app, this would delete from database
    return NextResponse.json({
      success: true,
      message: 'Geofence zone deleted successfully'
    })
  } catch (error) {
    console.error('Delete geofence error:', error)
    return NextResponse.json(
      { error: 'Failed to delete geofence zone' },
      { status: 500 }
    )
  }
}

function generateGeofenceZones(data: any): GeofenceZone[] {
  const zones: GeofenceZone[] = []
  const types = ['restricted', 'authorized', 'high-security', 'maintenance-only']
  const priorities = ['low', 'medium', 'high', 'critical']
  const roles = ['biomedical', 'nursing', 'admin', 'security', 'maintenance']
  
  // Generate 8 geofence zones
  for (let i = 1; i <= 8; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const zoneCount = Math.floor(Math.random() * 4) + 2 // 2-5 zones per geofence
    const assetCount = Math.floor(Math.random() * 15) + 5 // 5-19 assets per geofence
    
    const selectedZones = data.zones
      .sort(() => 0.5 - Math.random())
      .slice(0, zoneCount)
      .map((z: any) => z.id)
    
    const selectedAssets = data.assets
      .sort(() => 0.5 - Math.random())
      .slice(0, assetCount)
      .map((a: any) => a.id)
    
    const allowedRoleCount = Math.floor(Math.random() * 3) + 1
    const allowedRoles = roles
      .sort(() => 0.5 - Math.random())
      .slice(0, allowedRoleCount)
    
    zones.push({
      id: `geo-zone-${i}`,
      name: getGeofenceName(type, i),
      description: getGeofenceDescription(type),
      type: type as any,
      zoneIds: selectedZones,
      assetIds: selectedAssets,
      priority: priority as any,
      active: Math.random() > 0.1, // 90% active
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: ['John Doe', 'Jane Smith', 'Security Team', 'IT Admin'][Math.floor(Math.random() * 4)],
      updatedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      updatedBy: Math.random() > 0.3 ? 'System Admin' : undefined,
      alertOnEntry: Math.random() > 0.4,
      alertOnExit: Math.random() > 0.3,
      allowedRoles,
      workingHours: Math.random() > 0.5 ? {
        enabled: true,
        startTime: '08:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
      } : {
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // All days
      },
      coordinates: {
        x: Math.floor(Math.random() * 800) + 50,
        y: Math.floor(Math.random() * 600) + 50,
        width: Math.floor(Math.random() * 200) + 100,
        height: Math.floor(Math.random() * 150) + 75
      }
    })
  }
  
  return zones.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function getGeofenceName(type: string, index: number): string {
  const names = {
    'restricted': `Restricted Access Zone ${index}`,
    'authorized': `Authorized Personnel Zone ${index}`,
    'high-security': `High Security Zone ${index}`,
    'maintenance-only': `Maintenance Access Zone ${index}`
  }
  return names[type as keyof typeof names] || `Geofence Zone ${index}`
}

function getGeofenceDescription(type: string): string {
  const descriptions = {
    'restricted': 'Areas with limited access requiring special authorization',
    'authorized': 'Zones accessible only to authorized personnel with proper credentials',
    'high-security': 'Maximum security areas with strict access controls and monitoring',
    'maintenance-only': 'Areas designated for maintenance personnel and equipment only'
  }
  return descriptions[type as keyof typeof descriptions] || 'Protected area with access controls'
}