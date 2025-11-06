import { loadSeedData } from "@/lib/data-loader"
import { NextRequest, NextResponse } from "next/server"
import { 
  AssetProtectionDashboardData, 
  GeofenceViolation, 
  AssetProtectionAlert, 
  AssetMovementPattern,
  AssetProtectionMetrics 
} from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    
    // Get query parameters
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '24h'
    
    let startDate: Date
    const now = new Date()
    
    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Generate geofence violations
    const violations: GeofenceViolation[] = generateGeofenceViolations(data, startDate)
    
    // Generate protection alerts
    const alerts: AssetProtectionAlert[] = generateProtectionAlerts(data, violations)
    
    // Generate movement patterns
    const patterns: AssetMovementPattern[] = generateMovementPatterns(data, startDate)
    
    // Calculate metrics
    const metrics = calculateProtectionMetrics(data, violations, alerts, startDate)
    
    // Generate risk assets
    const riskAssets = generateRiskAssets(data, violations)
    
    // Generate protection coverage by department
    const protectionCoverage = generateProtectionCoverage(data, violations)

    const dashboardData: AssetProtectionDashboardData = {
      metrics,
      recentViolations: violations.slice(0, 10),
      activeAlerts: alerts.filter(a => a.status !== 'resolved').slice(0, 15),
      movementPatterns: patterns.slice(0, 8),
      riskAssets: riskAssets.slice(0, 10),
      protectionCoverage
    }
    
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Asset Protection Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to load asset protection dashboard data' },
      { status: 500 }
    )
  }
}

function generateGeofenceViolations(data: any, startDate: Date): GeofenceViolation[] {
  const violations: GeofenceViolation[] = []
  const violationTypes = ['entry', 'exit', 'unauthorized_presence', 'after_hours']
  const severities = ['low', 'medium', 'high', 'critical']
  const statuses = ['active', 'investigating', 'resolved', 'false_positive']
  
  // Generate violations from recent movement logs
  const recentMovements = data.movementLogs.filter((log: any) => 
    new Date(log.timestamp) >= startDate
  )
  
  recentMovements.forEach((movement: any, index: number) => {
    // 25% chance of generating a violation for each movement
    if (Math.random() < 0.25) {
      const asset = data.assets.find((a: any) => a.id === movement.assetId)
      const fromZone = data.zones.find((z: any) => z.id === movement.fromZoneId)
      const toZone = data.zones.find((z: any) => z.id === movement.toZoneId)
      
      if (asset && fromZone && toZone) {
        const violationType = violationTypes[Math.floor(Math.random() * violationTypes.length)]
        const severity = severities[Math.floor(Math.random() * severities.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        violations.push({
          id: `violation-${Date.now()}-${index}`,
          geofenceZoneId: `geo-zone-${Math.floor(Math.random() * 5) + 1}`,
          geofenceZoneName: `High Security Zone ${Math.floor(Math.random() * 5) + 1}`,
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          violationType: violationType as any,
          severity: severity as any,
          timestamp: movement.timestamp,
          fromZoneId: movement.fromZoneId,
          fromZoneName: fromZone.name,
          toZoneId: movement.toZoneId,
          toZoneName: toZone.name,
          detectedBy: `Reader-${Math.floor(Math.random() * 10) + 1}`,
          status: status as any,
          alertSent: Math.random() > 0.2,
          alertRecipients: ['biomedical-team@hospital.com', 'security@hospital.com'],
          responseTime: status === 'resolved' ? Math.floor(Math.random() * 120) + 5 : undefined,
          actionTaken: status === 'resolved' ? 'Asset relocated to authorized zone' : undefined,
          estimatedRisk: Math.floor(Math.random() * 10) + 1,
          resolvedAt: status === 'resolved' ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined,
          resolvedBy: status === 'resolved' ? 'Security Team' : undefined
        })
      }
    }
  })
  
  return violations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateProtectionAlerts(data: any, violations: GeofenceViolation[]): AssetProtectionAlert[] {
  const alerts: AssetProtectionAlert[] = []
  const alertTypes = ['geofence_violation', 'movement_anomaly', 'theft_risk', 'unauthorized_access', 'asset_missing']
  const statuses = ['new', 'acknowledged', 'investigating', 'resolved']
  const urgencies = ['immediate', 'within_hour', 'within_day', 'routine']
  const impacts = ['minimal', 'moderate', 'significant', 'critical']
  
  // Generate alerts from violations
  violations.forEach((violation, index) => {
    if (Math.random() < 0.8) { // 80% of violations generate alerts
      const asset = data.assets.find((a: any) => a.id === violation.assetId)
      const building = data.buildings.find((b: any) => b.id === asset?.location.buildingId)
      const floor = data.floors.find((f: any) => f.id === asset?.location.floorId)
      const zone = data.zones.find((z: any) => z.id === asset?.location.zoneId)
      
      if (asset && building && floor && zone) {
        alerts.push({
          id: `alert-${Date.now()}-${index}`,
          type: 'geofence_violation',
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          assetValue: Math.floor(Math.random() * 50000) + 5000,
          message: `Geofence violation detected for ${asset.name}`,
          description: `Asset ${asset.name} violated ${violation.geofenceZoneName} boundary`,
          severity: violation.severity,
          status: statuses[Math.floor(Math.random() * statuses.length)] as any,
          createdAt: violation.timestamp,
          targetRoles: ['biomedical', 'admin'],
          location: {
            buildingId: building.id,
            buildingName: building.name,
            floorId: floor.id,
            floorName: floor.name,
            zoneId: zone.id,
            zoneName: zone.name
          },
          relatedIds: {
            geofenceZoneId: violation.geofenceZoneId,
            violationId: violation.id
          },
          metadata: {
            riskScore: violation.estimatedRisk * 10,
            confidence: Math.floor(Math.random() * 30) + 70,
            patternMatch: 'unauthorized_zone_entry',
            triggerCondition: 'asset_entered_restricted_zone'
          },
          actionRequired: violation.severity === 'high' || violation.severity === 'critical',
          urgency: urgencies[Math.floor(Math.random() * urgencies.length)] as any,
          estimatedImpact: impacts[Math.floor(Math.random() * impacts.length)] as any
        })
      }
    }
  })
  
  // Generate additional standalone alerts
  for (let i = 0; i < 5; i++) {
    const asset = data.assets[Math.floor(Math.random() * data.assets.length)]
    const building = data.buildings.find((b: any) => b.id === asset.location.buildingId)
    const floor = data.floors.find((f: any) => f.id === asset.location.floorId)
    const zone = data.zones.find((z: any) => z.id === asset.location.zoneId)
    
    if (building && floor && zone) {
      alerts.push({
        id: `alert-standalone-${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        assetValue: Math.floor(Math.random() * 50000) + 5000,
        message: `Security alert for ${asset.name}`,
        description: `Automated security system detected anomalous behavior`,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        targetRoles: ['biomedical', 'admin'],
        location: {
          buildingId: building.id,
          buildingName: building.name,
          floorId: floor.id,
          floorName: floor.name,
          zoneId: zone.id,
          zoneName: zone.name
        },
        metadata: {
          riskScore: Math.floor(Math.random() * 100),
          confidence: Math.floor(Math.random() * 30) + 70
        },
        actionRequired: Math.random() > 0.4,
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)] as any,
        estimatedImpact: impacts[Math.floor(Math.random() * impacts.length)] as any
      })
    }
  }
  
  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function generateMovementPatterns(data: any, startDate: Date): AssetMovementPattern[] {
  const patterns: AssetMovementPattern[] = []
  const patternTypes = ['normal', 'unusual', 'suspicious', 'emergency']
  const reviewStatuses = ['pending', 'reviewed', 'cleared', 'escalated']
  
  // Group movements by asset
  const assetMovements = data.movementLogs
    .filter((log: any) => new Date(log.timestamp) >= startDate)
    .reduce((acc: any, log: any) => {
      if (!acc[log.assetId]) acc[log.assetId] = []
      acc[log.assetId].push(log)
      return acc
    }, {})
  
  Object.entries(assetMovements).forEach(([assetId, movements], index) => {
    if (Math.random() < 0.3) { // 30% of assets have patterns
      const asset = data.assets.find((a: any) => a.id === assetId)
      const movementArray = movements as any[]
      
      if (asset && movementArray.length > 2) {
        const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)]
        const isAnomalous = patternType !== 'normal'
        
        patterns.push({
          id: `pattern-${Date.now()}-${index}`,
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          patternType: patternType as any,
          description: getPatternDescription(patternType, asset.name),
          detectedAt: new Date().toISOString(),
          confidence: Math.floor(Math.random() * 30) + (isAnomalous ? 70 : 50),
          riskLevel: isAnomalous ? (['medium', 'high', 'critical'][Math.floor(Math.random() * 3)] as any) : 'low',
          movements: movementArray.slice(0, 5).map((mov: any) => {
            const fromZone = data.zones.find((z: any) => z.id === mov.fromZoneId)
            const toZone = data.zones.find((z: any) => z.id === mov.toZoneId)
            return {
              timestamp: mov.timestamp,
              fromZoneId: mov.fromZoneId,
              fromZoneName: fromZone?.name || 'Unknown',
              toZoneId: mov.toZoneId,
              toZoneName: toZone?.name || 'Unknown',
              duration: Math.floor(Math.random() * 120) + 5,
              velocity: Math.random() * 5 + 1
            }
          }),
          anomalyIndicators: {
            afterHours: Math.random() < 0.3,
            unauthorizedZones: isAnomalous && Math.random() < 0.5,
            rapidMovement: isAnomalous && Math.random() < 0.4,
            patternDeviation: isAnomalous && Math.random() < 0.6,
            frequencyAnomaly: isAnomalous && Math.random() < 0.3
          },
          alertGenerated: isAnomalous && Math.random() < 0.8,
          reviewStatus: reviewStatuses[Math.floor(Math.random() * reviewStatuses.length)] as any,
          reviewedBy: Math.random() < 0.5 ? 'Security Team' : undefined,
          reviewedAt: Math.random() < 0.5 ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined,
          notes: Math.random() < 0.3 ? 'Pattern requires further investigation' : undefined
        })
      }
    }
  })
  
  return patterns.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
}

function getPatternDescription(patternType: string, assetName: string): string {
  const descriptions = {
    normal: `Standard movement pattern detected for ${assetName}`,
    unusual: `Unusual movement pattern detected for ${assetName} - deviates from normal usage`,
    suspicious: `Suspicious movement pattern detected for ${assetName} - potential security concern`,
    emergency: `Emergency movement pattern detected for ${assetName} - immediate attention required`
  }
  return descriptions[patternType as keyof typeof descriptions] || `Movement pattern detected for ${assetName}`
}

function calculateProtectionMetrics(data: any, violations: GeofenceViolation[], alerts: AssetProtectionAlert[], startDate: Date): AssetProtectionMetrics {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const violationsToday = violations.filter(v => new Date(v.timestamp) >= todayStart).length
  const violationsThisWeek = violations.filter(v => new Date(v.timestamp) >= weekStart).length
  const violationsThisMonth = violations.filter(v => new Date(v.timestamp) >= monthStart).length
  
  const alertsToday = alerts.filter(a => new Date(a.createdAt) >= todayStart).length
  const alertsThisWeek = alerts.filter(a => new Date(a.createdAt) >= weekStart).length
  const alertsThisMonth = alerts.filter(a => new Date(a.createdAt) >= monthStart).length
  
  const resolvedViolations = violations.filter(v => v.status === 'resolved')
  const averageResponseTime = resolvedViolations.length > 0 
    ? resolvedViolations.reduce((sum, v) => sum + (v.responseTime || 0), 0) / resolvedViolations.length
    : 0
  
  const falsePositives = violations.filter(v => v.status === 'false_positive').length
  const falsePositiveRate = violations.length > 0 ? (falsePositives / violations.length) * 100 : 0
  
  // Generate violation trend for last 7 days
  const violationTrend = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    const dayViolations = violations.filter(v => v.timestamp.startsWith(dateStr))
    const dayResolved = dayViolations.filter(v => v.status === 'resolved')
    
    violationTrend.push({
      date: dateStr,
      violations: dayViolations.length,
      resolved: dayResolved.length
    })
  }
  
  // Calculate top violation types
  const violationTypeCounts = violations.reduce((acc, v) => {
    acc[v.violationType] = (acc[v.violationType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topViolationTypes = Object.entries(violationTypeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / violations.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  return {
    totalProtectedAssets: data.assets.length,
    activeGeofences: 5, // Mock number
    violationsToday,
    violationsThisWeek,
    violationsThisMonth,
    highValueAssetsAtRisk: Math.floor(data.assets.length * 0.15), // 15% of assets
    averageResponseTime: Math.round(averageResponseTime),
    falsePositiveRate: Math.round(falsePositiveRate * 100) / 100,
    alertsGenerated: {
      today: alertsToday,
      thisWeek: alertsThisWeek,
      thisMonth: alertsThisMonth
    },
    complianceScore: Math.floor(Math.random() * 20) + 80, // 80-100%
    topViolationTypes,
    violationTrend,
    geofenceEffectiveness: generateGeofenceEffectiveness()
  }
}

function generateGeofenceEffectiveness() {
  return [
    {
      zoneId: 'geo-zone-1',
      zoneName: 'High Security Zone 1',
      violationCount: Math.floor(Math.random() * 20) + 5,
      responseRate: Math.floor(Math.random() * 30) + 70,
      averageResponseTime: Math.floor(Math.random() * 60) + 15
    },
    {
      zoneId: 'geo-zone-2', 
      zoneName: 'Surgical Equipment Zone',
      violationCount: Math.floor(Math.random() * 15) + 3,
      responseRate: Math.floor(Math.random() * 25) + 75,
      averageResponseTime: Math.floor(Math.random() * 45) + 10
    },
    {
      zoneId: 'geo-zone-3',
      zoneName: 'Pharmacy Access Zone',
      violationCount: Math.floor(Math.random() * 25) + 8,
      responseRate: Math.floor(Math.random() * 20) + 80,
      averageResponseTime: Math.floor(Math.random() * 30) + 20
    }
  ]
}

function generateRiskAssets(data: any, violations: GeofenceViolation[]) {
  return data.assets
    .filter((asset: any) => Math.random() < 0.3) // 30% of assets are at risk
    .map((asset: any) => {
      const assetViolations = violations.filter(v => v.assetId === asset.id)
      const zone = data.zones.find((z: any) => z.id === asset.location.zoneId)
      const lastViolation = assetViolations.length > 0 ? assetViolations[0].timestamp : undefined
      
      return {
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        value: Math.floor(Math.random() * 75000) + 5000,
        riskScore: Math.floor(Math.random() * 100),
        location: zone?.name || 'Unknown Location',
        lastViolation,
        violationCount: assetViolations.length
      }
    })
    .sort((a: any, b: any) => b.riskScore - a.riskScore)
}

function generateProtectionCoverage(data: any, violations: GeofenceViolation[]) {
  return data.departments.map((dept: any) => {
    const deptAssets = data.assets.filter((a: any) => a.departmentId === dept.id)
    const protectedAssets = Math.floor(deptAssets.length * (Math.random() * 0.4 + 0.6)) // 60-100% protected
    const deptViolations = violations.filter(v => {
      const asset = data.assets.find((a: any) => a.id === v.assetId)
      return asset && asset.departmentId === dept.id
    })
    
    return {
      departmentId: dept.id,
      departmentName: dept.name,
      totalAssets: deptAssets.length,
      protectedAssets,
      coverage: Math.round((protectedAssets / deptAssets.length) * 100),
      violations: deptViolations.length
    }
  })
}