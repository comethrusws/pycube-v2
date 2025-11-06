import { loadSeedData } from "@/lib/data-loader"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const url = new URL(request.url)
    
    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const assetId = url.searchParams.get('assetId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const unauthorized = url.searchParams.get('unauthorized')
    const department = url.searchParams.get('department')
    const assetType = url.searchParams.get('assetType')
    const zoneId = url.searchParams.get('zoneId')
    const sortBy = url.searchParams.get('sortBy') || 'timestamp'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'
    
    let movementLogs = [...data.movementLogs]
    
    // Apply filters
    if (assetId) {
      movementLogs = movementLogs.filter(log => log.assetId === assetId)
    }
    
    if (startDate) {
      movementLogs = movementLogs.filter(log => 
        new Date(log.timestamp) >= new Date(startDate)
      )
    }
    
    if (endDate) {
      movementLogs = movementLogs.filter(log => 
        new Date(log.timestamp) <= new Date(endDate)
      )
    }
    
    if (unauthorized === 'true') {
      movementLogs = movementLogs.filter(log => !log.authorized)
    }
    
    if (department) {
      movementLogs = movementLogs.filter(log => {
        const asset = data.assets.find((a: any) => a.id === log.assetId)
        return asset && asset.departmentId === department
      })
    }
    
    if (assetType) {
      movementLogs = movementLogs.filter(log => {
        const asset = data.assets.find((a: any) => a.id === log.assetId)
        return asset && asset.type === assetType
      })
    }
    
    if (zoneId) {
      movementLogs = movementLogs.filter(log => 
        log.fromZoneId === zoneId || log.toZoneId === zoneId
      )
    }
    
    // Enhance logs with additional information
    const enhancedLogs = movementLogs.map(log => {
      const asset = data.assets.find((a: any) => a.id === log.assetId)
      const fromZone = data.zones.find((z: any) => z.id === log.fromZoneId)
      const toZone = data.zones.find((z: any) => z.id === log.toZoneId)
      const fromFloor = fromZone ? data.floors.find((f: any) => f.id === fromZone.floorId) : null
      const toFloor = toZone ? data.floors.find((f: any) => f.id === toZone.floorId) : null
      const fromBuilding = fromFloor ? data.buildings.find((b: any) => b.id === fromFloor.buildingId) : null
      const toBuilding = toFloor ? data.buildings.find((b: any) => b.id === toFloor.buildingId) : null
      const department = asset ? data.departments.find((d: any) => d.id === asset.departmentId) : null
      
      return {
        ...log,
        asset: asset ? {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          category: asset.category,
          tagId: asset.tagId,
          status: asset.status,
          value: Math.floor(Math.random() * 50000) + 5000 // Mock value
        } : null,
        fromLocation: {
          zoneId: log.fromZoneId,
          zoneName: fromZone?.name || 'Unknown Zone',
          floorId: fromFloor?.id,
          floorName: fromFloor?.name || 'Unknown Floor',
          buildingId: fromBuilding?.id,
          buildingName: fromBuilding?.name || 'Unknown Building'
        },
        toLocation: {
          zoneId: log.toZoneId,
          zoneName: toZone?.name || 'Unknown Zone',
          floorId: toFloor?.id,
          floorName: toFloor?.name || 'Unknown Floor',
          buildingId: toBuilding?.id,
          buildingName: toBuilding?.name || 'Unknown Building'
        },
        department: department ? {
          id: department.id,
          name: department.name
        } : null,
        duration: calculateDuration(log.timestamp),
        distance: calculateDistance(fromZone, toZone),
        riskLevel: assessRiskLevel(log, asset),
        compliance: {
          authorized: log.authorized,
          reason: log.reason || (log.authorized ? 'Regular operation' : 'Unauthorized movement'),
          reviewer: log.authorized ? null : 'Pending review',
          reviewDate: log.authorized ? null : undefined
        }
      }
    })
    
    // Sort logs
    enhancedLogs.sort((a, b) => {
      if (sortBy === 'timestamp') {
        const aTime = new Date(a.timestamp).getTime()
        const bTime = new Date(b.timestamp).getTime()
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
      }
      
      // Default to timestamp sort for other fields
      const aTime = new Date(a.timestamp).getTime()
      const bTime = new Date(b.timestamp).getTime()
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
    })
    
    // Pagination
    const total = enhancedLogs.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedLogs = enhancedLogs.slice(start, end)
    
    // Calculate summary statistics
    const summary = {
      totalMovements: total,
      authorizedMovements: enhancedLogs.filter(log => log.authorized).length,
      unauthorizedMovements: enhancedLogs.filter(log => !log.authorized).length,
      uniqueAssets: new Set(enhancedLogs.map(log => log.assetId)).size,
      uniqueZones: new Set([
        ...enhancedLogs.map(log => log.fromZoneId),
        ...enhancedLogs.map(log => log.toZoneId)
      ]).size,
      riskBreakdown: {
        low: enhancedLogs.filter(log => log.riskLevel === 'low').length,
        medium: enhancedLogs.filter(log => log.riskLevel === 'medium').length,
        high: enhancedLogs.filter(log => log.riskLevel === 'high').length,
        critical: enhancedLogs.filter(log => log.riskLevel === 'critical').length
      },
      departmentBreakdown: enhancedLogs.reduce((acc, log) => {
        if (log.department) {
          acc[log.department.name] = (acc[log.department.name] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      assetTypeBreakdown: enhancedLogs.reduce((acc, log) => {
        if (log.asset) {
          acc[log.asset.type] = (acc[log.asset.type] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
    }
    
    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      summary,
      filters: {
        departments: [...new Set(data.departments.map((d: any) => ({ id: d.id, name: d.name })))],
        assetTypes: [...new Set(data.assets.map((a: any) => a.type))],
        zones: data.zones.map((z: any) => ({
          id: z.id,
          name: z.name,
          floorName: data.floors.find((f: any) => f.id === z.floorId)?.name || 'Unknown Floor'
        }))
      }
    })
  } catch (error) {
    console.error('Movement Logs API error:', error)
    return NextResponse.json(
      { error: 'Failed to load movement logs' },
      { status: 500 }
    )
  }
}

function calculateDuration(timestamp: string): number {
  // Calculate time since movement (mock calculation)
  const movementTime = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - movementTime.getTime()
  return Math.floor(diffMs / (1000 * 60)) // Minutes
}

function calculateDistance(fromZone: any, toZone: any): number {
  // Mock distance calculation
  if (!fromZone || !toZone) return 0
  
  // Simple random distance based on zone names
  const seed = fromZone.name.length + toZone.name.length
  return Math.floor((seed * 3.7) % 100) + 10 // 10-110 meters
}

function assessRiskLevel(log: any, asset: any): 'low' | 'medium' | 'high' | 'critical' {
  if (!log.authorized) return 'high'
  if (!asset) return 'medium'
  
  // Base risk on asset type and time
  const hour = new Date(log.timestamp).getHours()
  const isAfterHours = hour < 6 || hour > 20
  const isHighValueAsset = ['MRI Machine', 'CT Scanner', 'Surgical Robot'].includes(asset.type)
  
  if (isAfterHours && isHighValueAsset) return 'critical'
  if (isAfterHours || isHighValueAsset) return 'high'
  if (Math.random() < 0.2) return 'medium'
  return 'low'
}