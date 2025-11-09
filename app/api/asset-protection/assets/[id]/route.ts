import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assetId } = await params
    const data = await loadSeedData()
    
    const asset = data.assets.find((a: any) => a.id === assetId)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Only consider tagged assets
    if (!asset.tagId) {
      return NextResponse.json({
        violations: [],
        alerts: [],
        movementPatterns: [],
        riskScore: 0,
        complianceStatus: 'not-monitored',
        summary: {
          totalViolations: 0,
          activeAlerts: 0,
          recentMovements: 0,
          riskLevel: 'low'
        }
      })
    }

    // Get recent movements for this asset (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const assetMovements = data.movementLogs.filter((log: any) => 
      log.assetId === assetId && new Date(log.timestamp) >= thirtyDaysAgo
    )

    // Generate violations for this asset
    const violations = generateAssetViolations(asset, assetMovements, data)
    
    // Generate alerts for this asset
    const alerts = generateAssetAlerts(asset, violations, data)
    
    // Generate movement patterns for this asset
    const movementPatterns = generateAssetMovementPatterns(asset, assetMovements, data)
    
    // Calculate risk score based on violations and patterns
    const riskScore = calculateAssetRiskScore(violations, movementPatterns, assetMovements)
    
    // Determine compliance status
    const complianceStatus = determineComplianceStatus(violations, alerts, riskScore)
    
    const summary = {
      totalViolations: violations.length,
      activeAlerts: alerts.filter(a => a.status !== 'resolved').length,
      recentMovements: assetMovements.length,
      riskLevel: riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low'
    }

    return NextResponse.json({
      violations: violations.slice(0, 10), // Recent 10 violations
      alerts: alerts.slice(0, 5), // Recent 5 alerts
      movementPatterns: movementPatterns.slice(0, 3), // Recent 3 patterns
      riskScore,
      complianceStatus,
      summary,
      geofenceStatus: {
        inAuthorizedZone: Math.random() > 0.1, // 90% chance in authorized zone
        lastGeofenceViolation: violations.length > 0 ? violations[0].timestamp : null,
        authorizedZones: [`Zone-${Math.floor(Math.random() * 5) + 1}`, `Zone-${Math.floor(Math.random() * 5) + 1}`]
      }
    })
  } catch (error) {
    console.error('Asset Protection API error:', error)
    return NextResponse.json(
      { error: 'Failed to load asset protection data' },
      { status: 500 }
    )
  }
}

function generateAssetViolations(asset: any, movements: any[], data: any): any[] {
  const violations: any[] = []
  const violationTypes = ['entry', 'exit', 'unauthorized_presence', 'after_hours']
  const severities = ['low', 'medium', 'high', 'critical']
  
  // Only 5-10% of movements generate violations
  const violationChance = 0.08
  
  movements.forEach((movement, index) => {
    if (Math.random() < violationChance) {
      const fromZone = data.zones.find((z: any) => z.id === movement.fromZoneId)
      const toZone = data.zones.find((z: any) => z.id === movement.toZoneId)
      
      if (fromZone && toZone) {
        const violationType = violationTypes[Math.floor(Math.random() * violationTypes.length)]
        
        // Weight severity towards lower levels
        const severityWeights = [0.6, 0.25, 0.12, 0.03] // low, medium, high, critical
        const severityRandom = Math.random()
        let severity = 'low'
        let cumulative = 0
        for (let i = 0; i < severityWeights.length; i++) {
          cumulative += severityWeights[i]
          if (severityRandom < cumulative) {
            severity = severities[i]
            break
          }
        }
        
        violations.push({
          id: `violation-${asset.id}-${index}`,
          violationType,
          severity,
          timestamp: movement.timestamp,
          fromZoneName: fromZone.name,
          toZoneName: toZone.name,
          description: `${violationType.replace('_', ' ')} violation detected`,
          status: Math.random() > 0.2 ? 'resolved' : 'active', // 80% resolved
          responseTime: Math.random() > 0.2 ? Math.floor(Math.random() * 45) + 5 : null
        })
      }
    }
  })
  
  return violations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateAssetAlerts(asset: any, violations: any[], data: any): any[] {
  const alerts: any[] = []
  const alertTypes = ['geofence_violation', 'movement_anomaly', 'theft_risk', 'unauthorized_access']
  
  // Generate alerts from violations (60% chance)
  violations.forEach((violation, index) => {
    if (Math.random() < 0.6) {
      alerts.push({
        id: `alert-${asset.id}-${index}`,
        type: 'geofence_violation',
        message: `Security alert: ${violation.description}`,
        severity: violation.severity,
        status: violation.status === 'resolved' ? 'resolved' : 'active',
        createdAt: violation.timestamp,
        description: `Asset protection system detected ${violation.violationType.replace('_', ' ')} for ${asset.name}`,
        actionRequired: violation.severity === 'high' || violation.severity === 'critical'
      })
    }
  })
  
  // Generate few additional alerts
  const additionalAlerts = Math.floor(Math.random() * 3) + 1 // 1-3 additional
  for (let i = 0; i < additionalAlerts; i++) {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const severity = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    
    alerts.push({
      id: `alert-additional-${asset.id}-${i}`,
      type: alertType,
      message: `Security alert: ${alertType.replace('_', ' ')} detected`,
      severity,
      status: Math.random() > 0.3 ? 'resolved' : 'active',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: `Automated monitoring detected ${alertType.replace('_', ' ')} for ${asset.name}`,
      actionRequired: severity === 'high'
    })
  }
  
  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function generateAssetMovementPatterns(asset: any, movements: any[], data: any): any[] {
  if (movements.length < 3) {
    return []
  }
  
  const patterns: any[] = []
  const patternTypes = ['normal', 'unusual', 'suspicious']
  
  // Generate 1-2 patterns for assets with sufficient movement
  const patternCount = Math.floor(Math.random() * 2) + 1
  
  for (let i = 0; i < patternCount; i++) {
    const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)]
    const isAnomalous = patternType !== 'normal'
    
    patterns.push({
      id: `pattern-${asset.id}-${i}`,
      patternType,
      description: `${patternType.charAt(0).toUpperCase() + patternType.slice(1)} movement pattern detected`,
      confidence: Math.floor(Math.random() * 30) + (isAnomalous ? 65 : 45),
      riskLevel: isAnomalous ? (['medium', 'high'][Math.floor(Math.random() * 2)]) : 'low',
      detectedAt: new Date().toISOString(),
      movementCount: movements.length,
      timeSpan: '30 days',
      anomalyIndicators: {
        afterHours: isAnomalous && Math.random() < 0.4,
        unauthorizedZones: isAnomalous && Math.random() < 0.3,
        rapidMovement: isAnomalous && Math.random() < 0.2
      }
    })
  }
  
  return patterns
}

function calculateAssetRiskScore(violations: any[], patterns: any[], movements: any[]) {
  let score = 0
  
  // Base score from violations
  violations.forEach(v => {
    switch (v.severity) {
      case 'critical': score += 25; break
      case 'high': score += 15; break
      case 'medium': score += 8; break
      case 'low': score += 3; break
    }
  })
  
  // Score from patterns
  patterns.forEach(p => {
    switch (p.riskLevel) {
      case 'high': score += 15; break
      case 'medium': score += 8; break
      case 'low': score += 2; break
    }
  })
  
  // Score from movement frequency (too much or too little can be risky)
  const movementScore = movements.length > 50 ? 10 : movements.length < 5 ? 8 : 0
  score += movementScore
  
  return Math.min(100, score) // Cap at 100
}

function determineComplianceStatus(violations: any[], alerts: any[], riskScore: number) {
  const activeViolations = violations.filter(v => v.status === 'active').length
  const activeAlerts = alerts.filter(a => a.status === 'active').length
  
  if (activeViolations > 2 || activeAlerts > 1 || riskScore >= 75) {
    return 'non-compliant'
  } else if (activeViolations > 0 || activeAlerts > 0 || riskScore >= 25) {
    return 'at-risk'
  } else {
    return 'compliant'
  }
}