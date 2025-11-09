import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const url = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '25')
    const sortBy = url.searchParams.get('sortBy') || 'timestamp'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'
    
    // Filter parameters
    const search = url.searchParams.get('search') || ''
    const department = url.searchParams.get('department') || ''
    const assetType = url.searchParams.get('assetType') || ''
    const unauthorized = url.searchParams.get('unauthorized') || ''
    const riskLevel = url.searchParams.get('riskLevel') || ''
    
    // Only process movement logs for tagged assets
    const taggedAssets = data.assets.filter((a: any) => a.tagId)
    const taggedAssetIds = new Set(taggedAssets.map((a: any) => a.id))
    
    // Generate realistic movement logs based on tagged assets only
    const movementLogs = data.movementLogs
      .filter((log: any) => taggedAssetIds.has(log.assetId))
      .map((log: any) => {
      const asset = taggedAssets.find((a: any) => a.id === log.assetId)
      const fromZone = data.zones.find((z: any) => z.id === log.fromZoneId)
      const toZone = data.zones.find((z: any) => z.id === log.toZoneId)
      const department = data.departments.find((d: any) => d.id === asset?.departmentId)
      
      // More realistic authorization rate - 95% authorized
      const authorized = log.authorized !== false && Math.random() > 0.05
      
      // Realistic risk levels - weighted towards lower risk
      const riskWeights = [0.65, 0.25, 0.08, 0.02] // low, medium, high, critical
      const riskLevels = ['low', 'medium', 'high', 'critical']
      const riskRandom = Math.random()
      let riskLevel = 'low'
      let cumulative = 0
      for (let i = 0; i < riskWeights.length; i++) {
        cumulative += riskWeights[i]
        if (riskRandom < cumulative) {
          riskLevel = riskLevels[i]
          break
        }
      }
      
      return {
        id: log.id,
        assetId: log.assetId,
        fromZoneId: log.fromZoneId,
        toZoneId: log.toZoneId,
        timestamp: log.timestamp,
        authorized,
        movedBy: log.movedBy || (Math.random() > 0.3 ? `Staff-${Math.floor(Math.random() * 100) + 1}` : undefined),
        asset: asset ? {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          category: asset.category,
          tagId: asset.tagId,
          status: asset.status,
          value: asset.value || Math.floor(Math.random() * 30000) + 5000
        } : null,
        fromLocation: {
          zoneId: log.fromZoneId,
          zoneName: fromZone?.name || 'Unknown Zone',
          floorId: fromZone?.floorId,
          floorName: `Floor ${Math.floor(Math.random() * 5) + 1}`,
          buildingId: 'building-1',
          buildingName: 'Main Hospital'
        },
        toLocation: {
          zoneId: log.toZoneId,
          zoneName: toZone?.name || 'Unknown Zone',
          floorId: toZone?.floorId,
          floorName: `Floor ${Math.floor(Math.random() * 5) + 1}`,
          buildingId: 'building-1',
          buildingName: 'Main Hospital'
        },
        department: department ? {
          id: department.id,
          name: department.name
        } : null,
        duration: Math.floor(Math.random() * 120) + 5, // 5-125 minutes ago
        distance: Math.floor(Math.random() * 200) + 10, // 10-210 meters
        riskLevel,
        compliance: {
          authorized,
          reason: authorized ? 'Routine equipment movement' : 
                 riskLevel === 'critical' ? 'Unauthorized movement detected' :
                 riskLevel === 'high' ? 'Movement outside approved hours' :
                 'Movement requires authorization',
          reviewer: authorized ? undefined : 'Security Team',
          reviewDate: authorized ? undefined : new Date().toISOString()
        }
      }
    })
    
    // Apply filters
    let filteredLogs = movementLogs.filter((log: any) => {
      if (search && !log.asset?.name.toLowerCase().includes(search.toLowerCase())) return false
      if (department && log.department?.id !== department) return false
      if (assetType && log.asset?.type !== assetType) return false
      if (unauthorized === 'true' && log.authorized) return false
      if (unauthorized === 'false' && !log.authorized) return false
      if (riskLevel && log.riskLevel !== riskLevel) return false
      return true
    })
    
    // Sort
    filteredLogs.sort((a: any, b: any) => {
      let aVal, bVal
      switch (sortBy) {
        case 'assetName':
          aVal = a.asset?.name || ''
          bVal = b.asset?.name || ''
          break
        case 'riskLevel':
          const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          aVal = riskOrder[a.riskLevel as keyof typeof riskOrder]
          bVal = riskOrder[b.riskLevel as keyof typeof riskOrder]
          break
        default: // timestamp
          aVal = new Date(a.timestamp).getTime()
          bVal = new Date(b.timestamp).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    // Pagination
    const total = filteredLogs.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)
    
    // Calculate summary statistics
    const totalMovements = movementLogs.length
    const authorizedMovements = movementLogs.filter((l: any) => l.authorized).length
    const unauthorizedMovements = totalMovements - authorizedMovements
    const uniqueAssets = new Set(movementLogs.map((l: any) => l.assetId)).size
    const uniqueZones = new Set([
      ...movementLogs.map((l: any) => l.fromZoneId),
      ...movementLogs.map((l: any) => l.toZoneId)
    ]).size
    
    const riskBreakdown = movementLogs.reduce((acc: any, log: any) => {
      acc[log.riskLevel] = (acc[log.riskLevel] || 0) + 1
      return acc
    }, {})
    
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
      summary: {
        totalMovements,
        authorizedMovements,
        unauthorizedMovements,
        uniqueAssets,
        uniqueZones,
        riskBreakdown: {
          low: riskBreakdown.low || 0,
          medium: riskBreakdown.medium || 0,
          high: riskBreakdown.high || 0,
          critical: riskBreakdown.critical || 0
        },
        departmentBreakdown: {},
        assetTypeBreakdown: {}
      },
      filters: {
        departments: data.departments.map((d: any) => ({ id: d.id, name: d.name })),
        assetTypes: [...new Set(data.assets.map((a: any) => a.type))],
        zones: data.zones.map((z: any) => ({ 
          id: z.id, 
          name: z.name, 
          floorName: `Floor ${Math.floor(Math.random() * 5) + 1}` 
        }))
      }
    })
  } catch (error) {
    console.error('Movement logs API error:', error)
    return NextResponse.json(
      { error: 'Failed to load movement logs' },
      { status: 500 }
    )
  }
}