import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import { pathToFileURL } from "url"
import { randomUUID } from "crypto"
import type {
  SeedData,
  GeneratorConfig,
  Facility,
  Department,
  Building,
  Floor,
  Zone,
  Reader,
  UserGroup,
  User,
  PointOfContact,
  Asset,
  UserLog,
  MovementLog,
  MaintenanceTask,
  MaintenanceRequest,
  Alert,
  UserUtilization,
  Status,
  MaintenanceStatus,
  LocationList,
  LocationActivity,
  PredictiveInsight,
  PredictiveMaintenanceData,
  DegradationTrend,
  Product,
  ProductCategory,
  ComplianceData,
  ComplianceAssetRisk,
} from "../lib/types"

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDateISO(daysBack = 365): string {
  const now = Date.now()
  const past = now - randomInt(0, daysBack) * 24 * 60 * 60 * 1000
  return new Date(past).toISOString()
}

const DEFAULT_CONFIG: GeneratorConfig = {
  facilityCount: 3,
  buildingsPerFacility: 4,
  floorsPerBuilding: 5,
  zonesPerFloor: 8,
  readersPerZone: 2,
  departmentsPerFacility: 6,
  assetsTotal: 6734, // Changed from 18000 to 6734 as requested
  usersPerDepartment: 12,
  maintenanceTaskPerAssetRatio: 0.3, // Increased for better maintenance data
  movementLogsPerAsset: 4, // Increased for better tracking
}

const ASSET_TYPES = [
  "Infusion Pump",
  "Centrifuge", 
  "ECG Monitor",
  "Ventilator",
  "Ultrasound",
  "X-Ray Machine",
  "Defibrillator",
  "Patient Monitor",
  "Syringe Pump",
  "Telemetry Transmitter",
  "MRI Scanner",
  "CT Scanner",
  "Dialysis Machine",
  "Anesthesia Machine",
  "Blood Gas Analyzer",
  "Pulse Oximeter",
  "Wheelchair",
  "Hospital Bed",
  "IV Stand",
  "Surgical Instruments"
]

const ASSET_CATEGORIES = [
  "Medical Equipment",
  "IT Equipment", 
  "Furniture",
  "Diagnostic Equipment",
  "Surgical Equipment",
  "Monitoring Equipment",
  "Life Support Equipment",
  "Laboratory Equipment",
  "Rehabilitation Equipment",
  "Emergency Equipment"
]

const ROLES = ["admin", "biomedical", "nursing", "technician", "viewer"]

function generatePredictiveMaintenanceData(
  assets: Asset[],
  maintenanceTasks: MaintenanceTask[],
  zones: Zone[]
): PredictiveMaintenanceData {
  // Only monitor tagged assets for predictive maintenance
  const taggedAssets = assets.filter(a => a.tagId && a.status !== "lost")
  const monitoredAssets = taggedAssets.slice(0, Math.floor(taggedAssets.length * 0.8))
  
  const insights: PredictiveInsight[] = monitoredAssets.map(asset => {
    const zone = zones.find(z => z.id === asset.location.zoneId)
    const assetMaintenanceHistory = maintenanceTasks.filter(t => t.assetId === asset.id)
    
    // Calculate realistic failure prediction based on asset characteristics
    let baseRiskScore = 50
    
    // Asset age influence (older assets more likely to fail)
    const ageInDays = Math.floor((Date.now() - new Date(asset.purchaseDate || '2022-01-01').getTime()) / (24 * 60 * 60 * 1000))
    const ageRiskMultiplier = Math.min(2, 1 + (ageInDays / 1095)) // 3 years = max multiplier
    
    // Utilization influence (high utilization = more wear)
    const utilizationRisk = asset.utilization > 80 ? 1.5 : asset.utilization < 20 ? 0.7 : 1.0
    
    // Maintenance history influence
    const overdueTasks = assetMaintenanceHistory.filter(t => t.status === "overdue").length
    const maintenanceRisk = 1 + (overdueTasks * 0.3)
    
    // Asset type influence (some equipment more critical)
    const criticalTypes = ["Ventilator", "MRI Scanner", "CT Scanner", "Defibrillator"]
    const typeRisk = criticalTypes.includes(asset.type) ? 1.3 : 1.0
    
    const riskScore = baseRiskScore * ageRiskMultiplier * utilizationRisk * maintenanceRisk * typeRisk
    
    // Convert risk score to failure window (higher risk = shorter window)
    const failureWindow = Math.max(5, Math.min(365, Math.round(180 - (riskScore - 50))))
    
    // Determine risk level and confidence
    let riskLevel: "low" | "medium" | "high"
    let confidence: number
    
    if (failureWindow <= 30) {
      riskLevel = "high"
      confidence = randomInt(75, 95)
    } else if (failureWindow <= 90) {
      riskLevel = "medium"  
      confidence = randomInt(60, 85)
    } else {
      riskLevel = "low"
      confidence = randomInt(45, 75)
    }
    
    // Generate key indicators
    const keyIndicators = {
      usageHours: Math.round(asset.utilization * 24 * 365 / 100),
      temperatureVariance: randomInt(1, 15),
      vibrationLevels: randomInt(10, 100),
      performanceDegradation: Math.round(Math.max(0, 100 - asset.utilization - randomInt(0, 20)))
    }
    
    // Maintenance history summary
    const lastTask = assetMaintenanceHistory
      .filter(t => t.status === "completed")
      .sort((a, b) => new Date(b.completedDate || b.scheduledDate).getTime() - new Date(a.completedDate || a.scheduledDate).getTime())[0]
    
    const nextTask = assetMaintenanceHistory
      .filter(t => t.status === "pending")
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0]
    
    const maintenanceHistory = {
      lastServiceDate: lastTask?.completedDate || lastTask?.scheduledDate || randomDateISO(90),
      nextScheduledService: nextTask?.scheduledDate || randomDateISO(-30),
      serviceCount: assetMaintenanceHistory.filter(t => t.status === "completed").length,
      avgServiceInterval: 90 + randomInt(-20, 40)
    }
    
    // Predicted issue based on risk factors
    const possibleIssues = [
      "Mechanical wear detected",
      "Performance degradation trend",
      "Temperature regulation variance", 
      "Calibration drift detected",
      "Component fatigue indicators",
      "Sensor accuracy decline",
      "Power consumption anomaly",
      "Vibration pattern changes"
    ]
    
    const predictedIssue = randomChoice(possibleIssues)
    
    // Recommended actions
    const actions = {
      high: ["Immediate inspection required", "Schedule emergency maintenance", "Consider replacement"],
      medium: ["Schedule maintenance within 2 weeks", "Increase monitoring frequency", "Prepare replacement parts"],
      low: ["Continue routine monitoring", "Schedule preventive maintenance", "Review usage patterns"]
    }
    
    return {
      id: randomUUID(),
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.type,
      location: zone?.name || "Unknown",
      departmentId: asset.departmentId,
      predictedFailureWindow: failureWindow,
      confidenceScore: confidence,
      riskLevel,
      predictedIssue,
      keyIndicators,
      maintenanceHistory,
      degradationScore: Math.round(100 - (failureWindow / 365) * 100),
      recommendedAction: randomChoice(actions[riskLevel]),
      createdAt: new Date().toISOString()
    }
  })
  
  // Sort by risk and get top 5
  const top5AtRisk = insights
    .filter(i => i.riskLevel === "high" || i.riskLevel === "medium")
    .sort((a, b) => a.predictedFailureWindow - b.predictedFailureWindow)
    .slice(0, 5)
  
  // Risk distribution
  const riskCounts = insights.reduce((acc, insight) => {
    acc[insight.riskLevel] = (acc[insight.riskLevel] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const riskDistribution = [
    { name: "High Risk", value: Math.round((riskCounts.high || 0) / insights.length * 100), count: riskCounts.high || 0, color: "#dc2626" },
    { name: "Medium Risk", value: Math.round((riskCounts.medium || 0) / insights.length * 100), count: riskCounts.medium || 0, color: "#ea580c" },
    { name: "Low Risk", value: Math.round((riskCounts.low || 0) / insights.length * 100), count: riskCounts.low || 0, color: "#059669" }
  ]
  
  // Degradation trends for top assets
  const degradationTrends = top5AtRisk.slice(0, 3).map(insight => ({
    assetId: insight.assetId,
    assetName: insight.assetName,
    trend: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      const baseScore = insight.degradationScore
      const dailyVariation = Math.sin(i / 7 * Math.PI) * 5 + (Math.random() - 0.5) * 8
      const trendIncrease = (i / 30) * 15 // Gradual increase over time
      
      return {
        date: date.toISOString().split('T')[0],
        degradationScore: Math.max(0, Math.min(100, baseScore + dailyVariation + trendIncrease)),
        usageHours: insight.keyIndicators.usageHours + randomInt(-50, 50),
        performanceIndex: Math.max(0, Math.min(100, 100 - (baseScore + dailyVariation + trendIncrease)))
      }
    })
  }))
  
  // Prediction accuracy over time
  const predictionAccuracy = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      accuracy: randomInt(65, 92),
      predictionsCount: randomInt(15, 45)
    }
  })
  
  return {
    summary: {
      totalAssetsMonitored: insights.length,
      highRiskAssets: riskCounts.high || 0,
      mediumRiskAssets: riskCounts.medium || 0,
      lowRiskAssets: riskCounts.low || 0,
      avgConfidenceScore: Math.round(insights.reduce((sum, i) => sum + i.confidenceScore, 0) / insights.length),
      potentialCostSavings: Math.round(insights.filter(i => i.riskLevel === "high").length * 2500 + insights.filter(i => i.riskLevel === "medium").length * 1200)
    },
    insights,
    top5AtRisk,
    riskDistribution,
    degradationTrends,
    predictionAccuracy
  }
}

function generateSeed(config: GeneratorConfig = DEFAULT_CONFIG): SeedData {
  const facilities: Facility[] = []
  const departments: Department[] = []
  const buildings: Building[] = []
  const floors: Floor[] = []
  const zones: Zone[] = []
  const readers: Reader[] = []
  const userGroups: UserGroup[] = []
  const users: User[] = []
  const pointsOfContact: PointOfContact[] = []
  const productCategories: ProductCategory[] = []
  const products: Product[] = []
  const assets: Asset[] = []
  const userLogs: UserLog[] = []
  const movementLogs: MovementLog[] = []
  const maintenanceTasks: MaintenanceTask[] = []
  const maintenanceRequests: MaintenanceRequest[] = []
  const alerts: Alert[] = []
  const userUtilizations: UserUtilization[] = []
  const locationLists: LocationList[] = []
  const locationActivities: LocationActivity[] = []

  // User groups
  for (const role of ROLES) {
    userGroups.push({ id: randomUUID(), name: role, permissions: ["read", ...(role === "admin" ? ["write", "manage"] : [])] })
  }

  for (let f = 0; f < config.facilityCount; f++) {
    const facilityId = randomUUID()
    const facility: Facility = {
      id: facilityId,
      name: `Facility ${f + 1}`,
      location: `City ${f + 1}`,
      departments: [],
      buildings: [],
    }
    facilities.push(facility)

    // Departments per facility
    for (let d = 0; d < config.departmentsPerFacility; d++) {
      const departmentId = randomUUID()
      const group = randomChoice(userGroups)
      const department: Department = {
        id: departmentId,
        name: `Department ${d + 1} - F${f + 1}`,
        facilityId: facilityId,
        users: [],
        assets: [],
      }
      departments.push(department)
      facility.departments.push(department)

      // Users per department
      for (let u = 0; u < config.usersPerDepartment; u++) {
        const user: User = {
          id: randomUUID(),
          name: `User ${u + 1} D${d + 1}F${f + 1}`,
          role: randomChoice(ROLES),
          groupId: group.id,
          departmentId: departmentId,
          lastLogin: randomDateISO(60),
        }
        users.push(user)
        department.users.push(user)
        userUtilizations.push({ userId: user.id, sessions: randomInt(1, 50), avgSessionTime: randomInt(3, 45) })
        userLogs.push({ id: randomUUID(), userId: user.id, action: "login", timestamp: user.lastLogin })
      }

      // Point of contact per department
      pointsOfContact.push({
        id: randomUUID(),
        name: `POC D${d + 1}F${f + 1}`,
        role: "manager",
        facilityId: facilityId,
        departmentId: departmentId,
        contact: `poc${d + 1}@facility${f + 1}.example.com`,
      })
    }

    // Buildings, floors, zones, readers
    for (let b = 0; b < config.buildingsPerFacility; b++) {
      const buildingId = randomUUID()
      const building: Building = { id: buildingId, name: `Building ${b + 1} - F${f + 1}`, facilityId, floors: [] }
      buildings.push(building)
      facility.buildings.push(building)

    for (let fl = 0; fl < config.floorsPerBuilding; fl++) {
        const floorId = randomUUID()
        const floor: Floor = { id: floorId, name: `Floor ${fl + 1}`, buildingId, zones: [] }
        floors.push(floor)
        building.floors.push(floor)

        const ZONE_NAMES = [
          "ICU",
          "Emergency",
          "Radiology",
          "Surgery",
          "Pediatrics",
          "Pharmacy",
          "Clinical Engineering",
          "General Ward",
          "Lab Services",
          "Reception",
        ]

        for (let z = 0; z < config.zonesPerFloor; z++) {
          const zoneId = randomUUID()
          const zoneName = ZONE_NAMES[(b * 100 + fl * 10 + z) % ZONE_NAMES.length]
          const zone: Zone = { id: zoneId, name: zoneName, floorId, readers: [] }
          zones.push(zone)
          floor.zones.push(zone)

          for (let r = 0; r < config.readersPerZone; r++) {
            const reader: Reader = { id: randomUUID(), name: `Reader ${r + 1}`, zoneId, status: Math.random() < 0.9 ? "online" : "offline" }
            readers.push(reader)
            zone.readers.push(reader)
          }
        }
      }
    }
  }

  // Map zones for quick random location selection
  const allZones = zones.map((z) => z.id)
  const zoneToFloor = new Map<string, string>()
  const floorToBuilding = new Map<string, string>()
  const buildingToFacility = new Map<string, string>()
  for (const fl of floors) floorToBuilding.set(fl.id, fl.buildingId)
  for (const b of buildings) buildingToFacility.set(b.id, b.facilityId)
  for (const z of zones) zoneToFloor.set(z.id, z.floorId)

  // Departments per facility ids for asset assignment
  const facilityToDepartments = new Map<string, string[]>()
  for (const dep of departments) {
    const list = facilityToDepartments.get(dep.facilityId) || []
    list.push(dep.id)
    facilityToDepartments.set(dep.facilityId, list)
  }

  const statuses: Status[] = ["available", "in-use", "maintenance", "lost"]

  // Weighted status distribution (more available, fewer lost)
  const statusPool: Status[] = [
    ...Array(55).fill("available"),
    ...Array(25).fill("in-use"),
    ...Array(15).fill("maintenance"),
    ...Array(5).fill("lost"),
  ]

  const taggingRate = 0.75 // Increased to 75% for better data

  // Generate product categories and products
  const manufacturerList = [
    "Medtronic", "GE Healthcare", "Philips", "Siemens", "Mindray",
    "Dräger", "Baxter", "Abbott", "Fresenius", "Stryker"
  ]

  for (const catName of ASSET_CATEGORIES) {
    productCategories.push({
      id: randomUUID(),
      name: catName,
      status: "active",
      createdAt: new Date().toISOString()
    })
  }

  const categoryIds = productCategories.map(c => c.id)
  const typeToProductId = new Map<string, string>()
  for (const typeName of ASSET_TYPES) {
    const category = randomChoice(productCategories)
    const p: Product = {
      id: randomUUID(),
      name: typeName,
      categoryId: category.id,
      category: category.name,
      manufacturer: randomChoice(manufacturerList),
      status: "active",
      sku: `SKU-${randomInt(100000, 999999)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      price: randomInt(1000, 50000),
      description: `Description for ${typeName}`
    }
    products.push(p)
    typeToProductId.set(typeName, p.id)
  }

  // Generate assets with enhanced data
  for (let a = 0; a < config.assetsTotal; a++) {
    const zoneId = randomChoice(allZones)
    const floorId = zoneToFloor.get(zoneId) as string
    const buildingId = floorToBuilding.get(floorId) as string
    const facilityId = buildingToFacility.get(buildingId) as string
    const deptIds = facilityToDepartments.get(facilityId) as string[]
    const departmentId = randomChoice(deptIds)

    const status = randomChoice(statusPool)
    const isTagged = Math.random() < taggingRate
    const type = randomChoice(ASSET_TYPES)
    const category = randomChoice(ASSET_CATEGORIES)
    const lastActiveDays = status === "in-use" ? randomInt(0, 3) : status === "available" ? randomInt(0, 14) : randomInt(7, 60)

    // Enhanced asset creation with better data distribution
    const asset: Asset = {
      id: randomUUID(),
      name: `${type} #${(a + 1).toString().padStart(4, "0")}`,
      type,
      category, // Add category field
      productId: typeToProductId.get(type),
      tagId: isTagged ? `TAG-${(a + 1).toString().padStart(6, "0")}` : "",
      departmentId,
      location: { buildingId, floorId, zoneId },
      status,
      utilization: (() => {
        // Create more realistic utilization patterns based on asset type and department
        let utilizationBase = 50
        
        // Asset type influences base utilization
        if (type.includes("Monitor") || type.includes("Ventilator") || type.includes("Pump")) {
          utilizationBase = 75 // High-demand equipment
        } else if (type.includes("IV Stand") || type.includes("Wheelchair") || type.includes("Hospital Bed")) {
          utilizationBase = 45 // Medium-demand equipment
        } else if (type.includes("Surgical") || type.includes("MRI") || type.includes("CT") || type.includes("X-Ray")) {
          utilizationBase = 35 // Specialized, scheduled equipment
        }

        // Department influences utilization (some departments are busier)
        const deptIndex = parseInt(departmentId.slice(-3)) % 6
        if (deptIndex < 2) {
          utilizationBase += 20 // High-activity departments (ICU, Emergency)
        } else if (deptIndex > 4) {
          utilizationBase -= 25 // Lower-activity departments (Storage, Admin)
        }

        // Status influences utilization
        if (status === "in-use") {
          utilizationBase = Math.max(utilizationBase, 60)
        } else if (status === "maintenance" || status === "lost") {
          utilizationBase = Math.min(utilizationBase, 20)
        }

        // Add randomness but ensure realistic distribution
        return Math.max(5, Math.min(98, utilizationBase + randomInt(-25, 25)))
      })(),
      lastActive: randomDateISO(lastActiveDays),
      maintenanceDue: status === "maintenance" ? randomDateISO(15) : randomDateISO(180),
      serialNumber: `SN${(a + 1).toString().padStart(8, "0")}`, // Add serial number
      purchaseDate: randomDateISO(365 * 3), // Within last 3 years
      warrantyExpiry: randomDateISO(-365), // Some expired, some future
      value: randomInt(1000, 50000), // Asset value
    }
    assets.push(asset)

    // Enhanced movement logs with more realistic patterns
    for (let m = 0; m < DEFAULT_CONFIG.movementLogsPerAsset; m++) {
      const fromZone = m === 0 ? randomChoice(allZones) : zoneId
      const toZoneId = randomChoice(allZones.filter(z => z !== fromZone))
      const daysAgo = m === 0 ? lastActiveDays : randomInt(7 * m, 30 * (m + 1))
      
      movementLogs.push({
        id: randomUUID(),
        assetId: asset.id,
        fromZoneId: fromZone,
        toZoneId,
        timestamp: randomDateISO(daysAgo),
        authorized: Math.random() > 0.05, // 95% authorized
        movedBy: randomChoice(users).id,
        reason: randomChoice(["maintenance", "patient_care", "cleaning", "inventory", "emergency"])
      })
    }

    // Enhanced maintenance tasks
    if (Math.random() < DEFAULT_CONFIG.maintenanceTaskPerAssetRatio) {
      const statuses: MaintenanceStatus[] = ["pending", "in-progress", "completed", "overdue"]
      const statusWeights = [0.3, 0.2, 0.4, 0.1] // More realistic distribution
      const selectedStatus = weightedChoice(statuses, statusWeights)
      const priorities = ["low", "medium", "high", "critical"]
      const maintenanceTypes = ["preventive", "corrective", "calibration", "inspection"]
      
      maintenanceTasks.push({
        id: randomUUID(),
        assetId: asset.id,
        type: randomChoice(maintenanceTypes),
        description: `${randomChoice(["Routine", "Emergency", "Scheduled"])} maintenance for ${asset.name}`,
        scheduledDate: randomDateISO(selectedStatus === "overdue" ? 30 : -60),
        completedDate: selectedStatus === "completed" ? randomDateISO(7) : undefined,
        status: selectedStatus,
        assignedTo: randomChoice(users.filter(u => u.role === "biomedical" || u.role === "technician")).id,
        priority: randomChoice(priorities),
        estimatedDuration: randomInt(30, 480), // 30 minutes to 8 hours
        cost: randomInt(50, 2000)
      })
    }

    // Generate alerts with better distribution
    if (Math.random() < 0.08) {
      const alertTypes: Alert["type"][] = ["movement", "maintenance", "geofence", "utilization", "battery"]
      const alert: Alert = {
        id: randomUUID(),
        type: randomChoice(alertTypes),
        assetId: asset.id,
        targetRole: randomChoice(["biomedical", "nursing", "admin"]),
        message: generateAlertMessage(randomChoice(alertTypes), asset.name),
        severity: randomChoice(["low", "medium", "high", "critical"]),
        createdAt: randomDateISO(30),
        resolved: Math.random() < 0.7,
        resolvedAt: Math.random() < 0.7 ? randomDateISO(15) : undefined,
        resolvedBy: Math.random() < 0.7 ? randomChoice(users).id : undefined
      }
      alerts.push(alert)
    }
  }

 // Enhanced user utilization data
  for (const user of users) {
    userUtilizations.push({
      userId: user.id,
      sessions: randomInt(5, 100),
      avgSessionTime: randomInt(10, 90),
      totalTime: randomInt(100, 2000),
      lastActivity: randomDateISO(7),
      featuresUsed: randomChoice([
        ["dashboard", "asset_search"],
        ["dashboard", "maintenance", "reports"],
        ["asset_search", "location", "alerts"],
        ["dashboard", "asset_search", "maintenance", "reports", "analytics"]
      ])
    })

    // More realistic user logs
    const logCount = randomInt(10, 50)
    for (let l = 0; l < logCount; l++) {
      userLogs.push({
        id: randomUUID(),
        userId: user.id,
        action: randomChoice([
          "login", "logout", "view_asset", "search_asset", "update_asset", 
          "create_maintenance", "resolve_alert", "generate_report", "export_data"
        ]),
        details: `User performed action in ${randomChoice(["dashboard", "asset_locator", "maintenance", "reports"])} module`,
        timestamp: randomDateISO(l * 2),
        ipAddress: `192.168.1.${randomInt(1, 254)}`,
        userAgent: "Mozilla/5.0 (compatible; PyCube/1.0)"
      })
    }
  }


  // Generate realistic maintenance requests
  const requestStatuses = ["Pending", "In Progress", "Completed", "Overdue"]
  const requestCategories = ["Preventive", "Corrective", "Emergency", "Calibration", "Inspection"]
  const priorities = ["Low", "Medium", "High", "Critical"]
  const urgencies = ["Low", "Normal", "High", "Urgent"]
  const criticalities = ["Low", "Medium", "High", "Critical"]

  const requestDescriptions = [
    "Regular maintenance check required",
    "Equipment showing performance issues",
    "Calibration required as per schedule",
    "Emergency repair needed",
    "Preventive maintenance overdue",
    "Safety inspection required",
    "Component replacement needed",
    "Performance optimization required",
    "Compliance check needed",
    "Annual maintenance service",
    "Battery replacement required",
    "Software update and calibration",
    "Cleaning and sanitization",
    "Sensor alignment check",
    "Firmware update required"
  ]

  // Generate 50-80 maintenance requests
  const requestCount = randomInt(50, 80)
  for (let i = 0; i < requestCount; i++) {
    const asset = randomChoice(assets)
    const zone = zones.find(z => z.id === asset.location.zoneId)
    const department = departments.find(d => d.id === asset.departmentId)
    const requestor = randomChoice(users.filter(u => u.departmentId === asset.departmentId))
    const assignedUser = randomChoice(users.filter(u => 
      u.role === "biomedical" || u.role === "technician" || u.role === "admin"
    ))

    const status = randomChoice(requestStatuses)
    const category = randomChoice(requestCategories)
    const priority = randomChoice(priorities)
    const urgency = randomChoice(urgencies)
    const criticality = randomChoice(criticalities)

    // Generate realistic maintenance dates based on status
    let maintenanceDate: string
    let createdDaysAgo: number
    
    if (status === "Completed") {
      createdDaysAgo = randomInt(7, 60)
      maintenanceDate = new Date(Date.now() - randomInt(1, createdDaysAgo) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    } else if (status === "Overdue") {
      createdDaysAgo = randomInt(30, 90)
      maintenanceDate = new Date(Date.now() - randomInt(1, 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    } else {
      createdDaysAgo = randomInt(1, 30)
      maintenanceDate = new Date(Date.now() + randomInt(1, 45) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    const createdDate = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000)
    const lastModified = new Date(createdDate.getTime() + randomInt(0, createdDaysAgo) * 24 * 60 * 60 * 1000)

    // Generate cost based on asset type and category
    let baseCost = 100
    if (asset.type.includes("MRI") || asset.type.includes("CT")) baseCost = 2000
    else if (asset.type.includes("Ventilator") || asset.type.includes("Monitor")) baseCost = 500
    else if (asset.type.includes("Pump") || asset.type.includes("ECG")) baseCost = 300
    else if (asset.type.includes("Wheelchair") || asset.type.includes("Bed")) baseCost = 150

    if (category === "Emergency") baseCost *= 2
    else if (category === "Preventive") baseCost *= 0.7
    else if (category === "Calibration") baseCost *= 1.5

    const estimatedCost = Math.round(baseCost * (0.5 + Math.random()))

    const maintenanceRequest: MaintenanceRequest = {
      id: `MR-${(i + 1).toString().padStart(3, '0')}`,
      status,
      requestor: requestor.name,
      category,
      priority,
      urgency,
      department: department?.name || `Department ${asset.departmentId.slice(-3)}`,
      description: `${randomChoice(requestDescriptions)} for ${asset.name}`,
      maintenanceDate,
      businessCriticality: criticality,
      lastModified: lastModified.toISOString().split('T')[0],
      assetName: asset.name,
      assetId: asset.id,
      estimatedCost,
      createdBy: requestor.name,
      assignedTo: status !== "Pending" ? assignedUser.name : undefined
    }

    maintenanceRequests.push(maintenanceRequest)
  }

  // Sort by creation date (most recent first)
  maintenanceRequests.sort((a, b) => 
    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  )

  // Link assets to departments
  const deptById = new Map(departments.map((d) => [d.id, d]))
  for (const asset of assets) {
    const d = deptById.get(asset.departmentId)
    if (d) d.assets.push(asset)
  }

  // Generate dashboard aggregated data
  const dashboardData = generateDashboardData(assets, maintenanceTasks, movementLogs, zones, users)

  // Generate location lists with comprehensive data
  const locationListNames = [
    "ICU Equipment Audit",
    "Emergency Department Inventory",
    "Surgical Suite Assets",
    "Main Warehouse Check",
    "Radiology Equipment Scan",
    "Pharmacy Asset Review",
    "Pediatrics Ward Audit",
    "Clinical Engineering Round",
    "General Ward Inventory",
    "Lab Equipment Check",
    "Cardiology Unit Scan",
    "Orthopedics Equipment",
    "Neurology Asset Audit",
    "Oncology Department Check",
    "Rehabilitation Equipment",
    "Outpatient Clinic Assets",
    "Medical Records Inventory",
    "IT Equipment Audit",
    "Biomedical Maintenance Check",
    "Annual Facility Inventory"
  ]

  const assignedGroups = [
    "CMC Group",
    "Biomedical Team",
    "Nursing Staff",
    "IT Department",
    "Clinical Engineering",
    "Asset Management",
    "Security Team",
    "Maintenance Crew"
  ]

  // Generate 25-30 location lists for comprehensive data
  for (let i = 0; i < 57; i++) {
    const listId = `LOC${(i + 1).toString().padStart(4, "0")}`
    const createdDaysAgo = randomInt(1, 120)
    const targetDaysFromCreation = randomInt(7, 30)
    const isCompleted = Math.random() < 0.6 // 60% completion rate
    const isOverdue = !isCompleted && Math.random() < 0.3 // 30% of incomplete are overdue
    
    const createdDate = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000)
    const targetDate = new Date(createdDate.getTime() + targetDaysFromCreation * 24 * 60 * 60 * 1000)
    const completedDate = isCompleted 
      ? new Date(createdDate.getTime() + randomInt(1, targetDaysFromCreation) * 24 * 60 * 60 * 1000)
      : undefined

    // Randomly assign assets to this location list (5-50 assets per list)
    const assetCount = randomInt(5, 50)
    const assignedAssets = assets
      .sort(() => Math.random() - 0.5)
      .slice(0, assetCount)
      .map(a => a.id)

    const completionPercentage = isCompleted 
      ? 100 
      : randomInt(10, 95)

    const status = isCompleted 
      ? "completed" 
      : isOverdue 
        ? "overdue" 
        : completionPercentage > 50 
          ? "in-progress" 
          : "pending"

    const locationList: LocationList = {
      id: randomUUID(),
      listId,
      listName: randomChoice(locationListNames),
      createdDate: createdDate.toISOString(),
      targetCompletionDate: targetDate.toISOString(),
      completedDate: completedDate?.toISOString(),
      createdBy: randomChoice(users).name,
      assignedGroup: randomChoice(assignedGroups),
      assetIds: assignedAssets,
      updatedBy: randomChoice(users).name,
      status,
      priority: randomChoice(["low", "medium", "high", "critical"]),
      description: `Comprehensive asset location verification for ${randomChoice(locationListNames).toLowerCase()}`,
      completionPercentage
    }

    locationLists.push(locationList)

    // Generate location activities for each list
    const activityCount = randomInt(5, Math.min(20, assignedAssets.length))
    for (let j = 0; j < activityCount; j++) {
      const assetId = randomChoice(assignedAssets)
      const asset = assets.find(a => a.id === assetId)
      const zone = zones.find(z => z.id === asset?.location.zoneId)
      
      const activity: LocationActivity = {
        id: randomUUID(),
        locationListId: locationList.id,
        assetId,
        action: randomChoice(["scanned", "located", "flagged", "updated"]),
        timestamp: new Date(
          createdDate.getTime() + randomInt(0, (Date.now() - createdDate.getTime()))
        ).toISOString(),
        performedBy: randomChoice(users).name,
        notes: randomChoice([
          "Asset located in expected zone",
          "Asset found in different location",
          "Asset requires maintenance check",
          "Asset tagged successfully",
          "Location verified and updated",
          undefined
        ]),
        location: zone ? {
          zoneId: zone.id,
          zoneName: zone.name
        } : undefined
      }

      locationActivities.push(activity)
    }
  }

  // Generate enhanced asset-locator data with location lists
  const assetLocatorData = generateAssetLocatorData(assets, movementLogs, zones, maintenanceTasks, locationLists)

  // Generate predictive maintenance data (only for tagged assets)
  const predictiveMaintenanceData = generatePredictiveMaintenanceData(assets, maintenanceTasks, zones)

  // Generate compliance data
  const complianceData: ComplianceData = (() => {
    const deptMap = new Map(departments.map(d => [d.id, d.name]))
    
    // Only consider tagged assets for compliance monitoring
    const taggedAssets = assets.filter(a => a.tagId)
    const recallSet = new Set(taggedAssets.filter(() => Math.random() < 0.01).map(a => a.id))

    const assetRisks: ComplianceAssetRisk[] = taggedAssets.slice(0, Math.min(taggedAssets.length, 3000)).map(a => {
      const missedMaintenance = maintenanceTasks.filter(t => t.assetId === a.id && t.status === "overdue").length
      const overdueCalibration = Math.random() < 0.05 ? 1 : 0
      const recallFlag = recallSet.has(a.id)
      let risk = 100
      risk -= missedMaintenance * 20
      risk -= overdueCalibration * 15
      if (recallFlag) risk -= 25
      if (a.utilization < 20) risk -= 10
      risk = Math.max(0, Math.min(100, Math.round(risk)))
      return {
        assetId: a.id,
        assetName: a.name,
        departmentId: a.departmentId,
        departmentName: deptMap.get(a.departmentId) || `Department ${a.departmentId.slice(-3)}`,
        missedMaintenance,
        overdueCalibration,
        recallFlag,
        riskScore: risk,
      }
    })

    const totalAssets = taggedAssets.length // Only count tagged assets
    const fullyCompliant = assetRisks.filter(r => r.missedMaintenance === 0 && r.overdueCalibration === 0 && !r.recallFlag && r.riskScore >= 90).length
    const overdueMaintenance = maintenanceTasks.filter(t => {
      const asset = taggedAssets.find(a => a.id === t.assetId)
      return asset && t.status === "overdue"
    }).length
    const recallActions = recallSet.size
    const avgRisk = Math.round(assetRisks.reduce((s, r) => s + r.riskScore, 0) / Math.max(1, assetRisks.length))

    const byDept = new Map<string, { name: string; high: number; medium: number; low: number }>()
    for (const r of assetRisks) {
      const bucket = r.riskScore < 70 ? 'high' : r.riskScore < 90 ? 'medium' : 'low'
      const cur = byDept.get(r.departmentId) || { name: r.departmentName, high: 0, medium: 0, low: 0 }
      cur[bucket as 'high' | 'medium' | 'low']++
      byDept.set(r.departmentId, cur)
    }

    const noncomplianceTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      const base = overdueMaintenance / Math.max(1, totalAssets)
      const noise = (Math.random() - 0.5) * 0.02
      const value = Math.max(0, Math.round((base + noise) * totalAssets * 0.2))
      return { date: date.toISOString().split('T')[0], noncompliant: value }
    })

    const overallScore = Math.max(0, Math.min(100,
      100 - Math.round((overdueMaintenance / Math.max(1, totalAssets)) * 100) + Math.round((fullyCompliant / Math.max(1, totalAssets)) * 10)
    ))

    return {
      summary: {
        overallScore,
        totalAssets,
        fullyCompliant,
        overdueMaintenance,
        recallActions,
        averageRiskScore: avgRisk,
        riskByDepartment: Array.from(byDept.entries()).map(([departmentId, v]) => ({
          departmentId,
          departmentName: v.name,
          high: v.high,
          medium: v.medium,
          low: v.low,
        })),
        noncomplianceTrend,
      },
      assetRisks,
    }
  })()

  return {
    facilities,
    departments,
    buildings,
    floors,
    zones,
    readers,
    userGroups,
    users,
    pointsOfContact,
    products,
    productCategories,
    assets,
    userLogs,
    movementLogs,
    maintenanceTasks,
    maintenanceRequests,
    alerts,
    userUtilizations,
    locationLists,
    locationActivities,
    dashboardData,
    assetLocatorData,
    predictiveMaintenanceData,
    complianceData,
  }
}

// Helper functions
function weightedChoice<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) return items[i]
  }
  
  return items[items.length - 1]
}

function generateAlertMessage(type: string, assetName: string): string {
  const messages = {
    movement: `Unauthorized movement detected for ${assetName}`,
    maintenance: `Maintenance overdue for ${assetName}`,
    geofence: `${assetName} has left designated area`,
    utilization: `Low utilization detected for ${assetName}`,
    battery: `Low battery warning for ${assetName}`
  }
  return messages[type as keyof typeof messages] || `Alert for ${assetName}`
}

function generateDashboardData(assets: Asset[], maintenanceTasks: MaintenanceTask[], movementLogs: MovementLog[], zones: Zone[], users: User[]) {
  // Asset statistics
  const totalAssets = assets.length
  const taggedAssets = assets.filter(a => a.tagId).length
  const untaggedAssets = totalAssets - taggedAssets
  const percentTagged = Math.round((taggedAssets / totalAssets) * 100)

  // Status overview
  const statusCounts = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Recent assets (last 30 days activity)
  const recent30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentAssets = assets
    .filter(a => new Date(a.lastActive) > recent30Days)
    .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
    .slice(0, 10)
    .map(asset => {
      const zone = zones.find(z => z.id === asset.location.zoneId)
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        location: zone?.name || "Unknown",
        status: asset.status,
        lastActive: asset.lastActive
      }
    })

  // Top categories by count
  const categoryCounts = assets.reduce((acc, asset) => {
    const category = asset.category || asset.type
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  // Maintenance due (next 30 days)
  const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const maintenanceDue = maintenanceTasks
    .filter(task => task.status === "pending" && new Date(task.scheduledDate) <= next30Days)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 10)
    .map(task => {
      const asset = assets.find(a => a.id === task.assetId)
      return {
        id: task.id,
        assetId: task.assetId,
        name: asset?.name || "Unknown Asset",
        dueDate: task.scheduledDate,
        type: task.type || "maintenance"
      }
    })

  // Zones not scanned (no recent movement)
  const recentMovements = movementLogs.filter(log => 
    new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )
  const scannedZoneIds = new Set(recentMovements.map(log => log.toZoneId))
  const zonesNotScanned = zones
    .filter(zone => !scannedZoneIds.has(zone.id))
    .map(zone => zone.name)
    .slice(0, 10)

  // Visibility trends (last 7 days)
  const visibilityTrend = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayMovements = movementLogs.filter(log => 
      log.timestamp.startsWith(dateStr)
    )
    const scannedAssets = new Set(dayMovements.map(log => log.assetId)).size
    const notScannedAssets = totalAssets - scannedAssets
    
    visibilityTrend.push({
      date: dateStr,
      scanned: scannedAssets,
      notScanned: notScannedAssets
    })
  }

  return {
    stats: {
      totalAssets,
      totalFacilities: 3, // From config
      totalUsers: users.length,
      categories: topCategories.length
    },
    tagging: {
      tagged: taggedAssets,
      untagged: untaggedAssets,
      percentTagged
    },
    overview: {
      notFound: statusCounts.lost || 0,
      inUse: statusCounts["in-use"] || 0,
      found: statusCounts.available || 0
    },
    visibility: {
      scanned: assets.filter(a => new Date(a.lastActive) > recent30Days).length,
      notScanned: assets.filter(a => new Date(a.lastActive) <= recent30Days).length,
      trend: visibilityTrend
    },
    zonesNotScanned,
    assetDetails: {
      recentAssets,
      topCategories,
      maintenanceDue
    }
  }
}

function generateAssetLocatorData(
  assets: Asset[], 
  movementLogs: MovementLog[], 
  zones: Zone[], 
  maintenanceTasks: MaintenanceTask[],
  locationLists: LocationList[]
) {
  const totalAssets = assets.length
  const locatedAssets = assets.filter(a => a.status !== "lost").length
  const assetsToLocate = totalAssets - locatedAssets
  const flaggedAssets = assets.filter(a => 
    a.status === "lost" || 
    maintenanceTasks.some(m => m.assetId === a.id && m.status === "overdue")
  ).length

  // Enhanced utilization analytics
  const underutilizedAssets = assets.filter(a => a.utilization < 40)
  const underutilizedCount = underutilizedAssets.length
  const avgUtilization = Math.round(assets.reduce((sum, a) => sum + a.utilization, 0) / assets.length)

  // Department-level utilization analysis with enhanced data
  const deptUtilization = assets.reduce((acc, asset) => {
    if (!acc[asset.departmentId]) {
      acc[asset.departmentId] = {
        assets: [],
        totalUtilization: 0,
        underutilized: 0,
        active: 0,
        idle: 0,
        inMaintenance: 0,
        available: 0,
        pendingMaintenance: 0
      }
    }
    acc[asset.departmentId].assets.push(asset)
    acc[asset.departmentId].totalUtilization += asset.utilization
    if (asset.utilization < 40) {
      acc[asset.departmentId].underutilized++
      acc[asset.departmentId].idle++
    } else {
      acc[asset.departmentId].active++
    }
    if (asset.status === "maintenance") {
      acc[asset.departmentId].inMaintenance++
    }
    if (asset.status === "available") {
      acc[asset.departmentId].available++
    }
    return acc
  }, {} as Record<string, { 
    assets: Asset[], 
    totalUtilization: number, 
    underutilized: number,
    active: number,
    idle: number,
    inMaintenance: number,
    available: number,
    pendingMaintenance: number
  }>)

  maintenanceTasks.forEach(task => {
    const asset = assets.find(a => a.id === task.assetId)
    if (asset && task.status === 'pending') {
      if (deptUtilization[asset.departmentId]) {
        deptUtilization[asset.departmentId].pendingMaintenance++
      }
    }
  })

  let departmentUtilization = Object.entries(deptUtilization).map(([deptId, data]) => {
    const totalAssets = data.assets.length;
    const underMaintenancePct = Math.round((data.inMaintenance / totalAssets) * 100)
    const pendingMaintenancePct = Math.round((data.pendingMaintenance / totalAssets) * 100)
    const availablePct = Math.max(0, 100 - underMaintenancePct - pendingMaintenancePct)

    return {
      departmentId: deptId,
      departmentName: `Department ${deptId.slice(-3)}`,
      avgUtilization: Math.round(data.totalUtilization / totalAssets),
      totalAssets: totalAssets,
      underutilized: data.underutilized,
      active: data.active,
      idle: data.idle,
      inMaintenance: data.inMaintenance,
      // Stacked bar values that must sum to 100
      available: availablePct,
      underMaintenance: underMaintenancePct,
      pendingMaintenance: pendingMaintenancePct,
      utilizationTrend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        utilization: Math.max(20, Math.min(95, data.totalUtilization / data.assets.length + randomInt(-15, 15)))
      }))
    }
  }).sort((a, b) => b.avgUtilization - a.avgUtilization)

  // Ensure distribution so filters (40/60/80) always show data
  const n = departmentUtilization.length
  if (n > 0) {
    // Top 4-5 fully utilized (>= 90%)
    const topCount = Math.min(5, n)
    for (let i = 0; i < topCount; i++) {
      departmentUtilization[i].avgUtilization = Math.max(departmentUtilization[i].avgUtilization, 90 + randomInt(0, 7))
    }

    // Bottom 2-3 under 40%
    const low40Count = Math.min(3, n)
    for (let i = 0; i < low40Count; i++) {
      const idx = n - 1 - i
      departmentUtilization[idx].avgUtilization = Math.min(departmentUtilization[idx].avgUtilization, 25 + randomInt(0, 12)) // 25-37
    }

    // Next 2-3 in 45-57% bucket (under 60)
    const low60Count = Math.min(3, Math.max(0, n - low40Count - topCount))
    for (let i = 0; i < low60Count; i++) {
      const idx = n - 1 - low40Count - i
      departmentUtilization[idx].avgUtilization = 45 + randomInt(0, 12) // 45-57
    }
  }

  // Asset type utilization breakdown
  const typeUtilization = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = { total: 0, utilization: 0, underutilized: 0 }
    }
    acc[asset.type].total++
    acc[asset.type].utilization += asset.utilization
    if (asset.utilization < 40) acc[asset.type].underutilized++
    return acc
  }, {} as Record<string, { total: number, utilization: number, underutilized: number }>)

  const assetTypeUtilization = Object.entries(typeUtilization)
    .map(([type, data]) => ({
      type,
      avgUtilization: Math.round(data.utilization / data.total),
      totalAssets: data.total,
      underutilized: data.underutilized,
      utilizationRate: Math.round((data.total - data.underutilized) / data.total * 100)
    }))
    .sort((a, b) => a.avgUtilization - b.avgUtilization)

  // Redistribution suggestions based on utilization imbalance
  const redistributionSuggestions = []
  const lowUtilDepts = departmentUtilization.filter(d => d.avgUtilization < 50).slice(0, 3)
  const highUtilDepts = departmentUtilization.filter(d => d.avgUtilization > 80).slice(0, 3)

  for (const lowDept of lowUtilDepts) {
    for (const highDept of highUtilDepts) {
      // Find underutilized assets that could benefit from redistribution
      const lowDeptAssets = assets.filter(a => 
        a.departmentId === lowDept.departmentId && 
        a.utilization < 30 &&
        a.status === "available"
      )
      
      // Find what types are in demand in high-utilization departments
      const highDeptAssets = assets.filter(a => a.departmentId === highDept.departmentId)
      const highDemandTypes = [...new Set(highDeptAssets.filter(a => a.utilization > 70).map(a => a.type))]
      
      // Find matching assets that could be redistributed
      const redistributableAssets = lowDeptAssets.filter(a => 
        highDemandTypes.includes(a.type) || 
        a.type.includes("Monitor") || 
        a.type.includes("Pump") || 
        a.type.includes("Bed") ||
        a.type.includes("Wheelchair")
      )
      
      if (redistributableAssets.length > 0) {
        const suggestedAsset = randomChoice(redistributableAssets)
        const potentialGain = randomInt(25, 45)
        const currentCost = (suggestedAsset.value || 5000) * 0.1  // 10% of asset value annually for underutilization
        const projectedSavings = Math.floor(currentCost * (potentialGain / 100))
        
        redistributionSuggestions.push({
          id: randomUUID(),
          assetId: suggestedAsset.id,
          assetName: suggestedAsset.name,
          assetType: suggestedAsset.type,
          currentUtilization: suggestedAsset.utilization,
          fromDepartment: lowDept.departmentName,
          fromDepartmentId: lowDept.departmentId,
          toDepartment: highDept.departmentName,
          toDepartmentId: highDept.departmentId,
          potentialImpact: `+${potentialGain}% utilization`,
          priority: suggestedAsset.utilization < 15 ? "high" : 
                   suggestedAsset.utilization < 25 ? "medium" : "low",
          estimatedSavings: projectedSavings,
          reason: `${suggestedAsset.type} shows ${suggestedAsset.utilization}% utilization in ${lowDept.departmentName}, while ${highDept.departmentName} has high demand for similar equipment`
        })
        
        // Limit to avoid too many suggestions
        if (redistributionSuggestions.length >= 8) break
      }
    }
    if (redistributionSuggestions.length >= 8) break
  }

  // Idle asset alerts
  const idleAssets = assets
    .filter(a => a.utilization < 20 && a.status === "available")
    .sort((a, b) => a.utilization - b.utilization)
    .slice(0, 10)
    .map(asset => {
      const zone = zones.find(z => z.id === asset.location.zoneId)
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        utilization: asset.utilization,
        location: zone?.name || "Unknown",
        departmentId: asset.departmentId,
        lastActive: asset.lastActive,
        idleDays: Math.floor((Date.now() - new Date(asset.lastActive).getTime()) / (24 * 60 * 60 * 1000))
      }
    })

  // Top 10 Idle Assets with enhanced details
  const top10IdleAssets = assets
    .filter(a => a.utilization < 30 && a.status === "available")
    .sort((a, b) => a.utilization - b.utilization)
    .slice(0, 10)
    .map(asset => {
      const zone = zones.find(z => z.id === asset.location.zoneId)
      const department = departmentUtilization.find(d => d.departmentId === asset.departmentId)
      const idleDays = Math.floor((Date.now() - new Date(asset.lastActive).getTime()) / (24 * 60 * 60 * 1000))
      
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        department: department?.departmentName || "Unknown Department",
        departmentId: asset.departmentId,
        utilization: asset.utilization,
        location: zone?.name || "Unknown",
        lastUsed: asset.lastActive,
        idleDuration: idleDays,
        recommendedAction: idleDays > 30 ? "Consider Redistribution" : 
                          idleDays > 14 ? "Schedule Utilization Review" : 
                          "Monitor Usage Pattern",
        value: asset.value || 0,
        status: asset.status
      }
    })

  // Utilization Trend Over Time (last 30 days) - Enhanced for better visualization
  const utilizationTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    
    // Create more realistic utilization patterns with better bounds
    const baseUtilization = Math.max(40, Math.min(85, avgUtilization))
    
    // Multi-layered variation for realistic data
    const weeklyPattern = Math.sin((i / 7) * 2 * Math.PI) * 12 // 7-day cycle
    const monthlyTrend = Math.sin((i / 30) * Math.PI) * 8 // Monthly trend
    const weekdayEffect = date.getDay() === 0 || date.getDay() === 6 ? -15 : 5 // Weekend vs weekday
    const randomNoise = (Math.random() - 0.5) * 8 // Daily random variation
    
    let utilization = baseUtilization + weeklyPattern + monthlyTrend + weekdayEffect + randomNoise
    
    // Check for maintenance events that might cause drops
    const maintenanceEvents = maintenanceTasks.filter(task => 
      task.scheduledDate.startsWith(dateStr) || 
      (task.completedDate && task.completedDate.startsWith(dateStr))
    ).length
    
    // Apply maintenance impact more realistically
    const maintenanceImpact = Math.min(25, maintenanceEvents * 4)
    utilization -= maintenanceImpact
    
    // Ensure realistic bounds (30-95%)
    utilization = Math.max(30, Math.min(95, utilization))
    
    return {
      date: dateStr,
      displayDate: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
      utilization: Math.round(utilization),
      maintenanceEvents,
      tooltip: maintenanceEvents > 5 ? `${maintenanceEvents} maintenance tasks scheduled` : null
    }
  })

  // Maintenance Impact on Availability
  const availableAssets = assets.filter(a => a.status === "available").length
  const underMaintenanceAssets = assets.filter(a => a.status === "maintenance").length
  const pendingMaintenanceAssets = maintenanceTasks.filter(t => t.status === "pending").length
  
  const maintenanceImpact = [
    { 
      name: "Available", 
      value: Math.round((availableAssets / totalAssets) * 100),
      count: availableAssets,
      color: "#059669" 
    },
    { 
      name: "Under Maintenance", 
      value: Math.round((underMaintenanceAssets / totalAssets) * 100),
      count: underMaintenanceAssets,
      color: "#dc2626" 
    },
    { 
      name: "Pending Maintenance", 
      value: Math.round((pendingMaintenanceAssets / totalAssets) * 100),
      count: pendingMaintenanceAssets,
      color: "#d97706" 
    }
  ]

  // Asset Movement Alerts (from recent movement logs) - More realistic for 6734 assets
  const recentMovements = movementLogs
    .filter(log => {
      const logDate = new Date(log.timestamp)
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      return logDate > twoDaysAgo && (!log.authorized || Math.random() < 0.05) // Only 5% flagged as abnormal
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, Math.min(25, Math.floor(totalAssets * 0.001))) // Max 0.1% of total assets or 25
    .map(log => {
      const asset = assets.find(a => a.id === log.assetId)
      const fromZone = zones.find(z => z.id === log.fromZoneId)
      const toZone = zones.find(z => z.id === log.toZoneId)
      
      return {
        id: log.id,
        assetId: log.assetId,
        assetName: asset?.name || "Unknown Asset",
        assetType: asset?.type || "Unknown",
        fromLocation: fromZone?.name || "Unknown",
        toLocation: toZone?.name || "Unknown",
        timestamp: log.timestamp,
        alertType: !log.authorized ? "Unauthorized Movement" : 
                  Math.random() < 0.6 ? "Out-of-Zone Event" : "Abnormal Movement Pattern",
        severity: !log.authorized ? "high" : "medium",
        status: Math.random() < 0.7 ? "resolved" : "pending", // Most resolved
        movedBy: log.movedBy || "Unknown User"
      }
    })

  // Monitored product categories with realistic distribution
  const categoryCounts = assets.reduce((acc, asset) => {
    const category = asset.category || asset.type
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalCategoryAssets = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
  const monitoredCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([name, count], index) => ({
      name,
      value: Math.round((count / totalCategoryAssets) * 100),
      color: [
        "#0d7a8c", "#1e40af", "#7c3aed", "#dc2626", 
        "#059669", "#d97706", "#be123c", "#4338f5"
      ][index % 8]
    }))

  // Location trends (last 30 days)
  const locationTrends = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
    
    const dayMovements = movementLogs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate.toDateString() === date.toDateString()
    })
    
    const locatedCount = new Set(dayMovements.map(log => log.assetId)).size
    const unlocatedCount = Math.max(0, Math.floor(totalAssets * 0.15) - locatedCount + randomInt(-5, 5))
    
    locationTrends.push({
      date: dateStr,
      located: locatedCount + randomInt(50, 150),
      unlocated: Math.max(0, unlocatedCount)
    })
  }

  // Recorded asset locations distribution
  const zoneCounts = assets.reduce((acc, asset) => {
    const zone = zones.find(z => z.id === asset.location.zoneId)
    const zoneName = zone?.name || "Unknown"
    acc[zoneName] = (acc[zoneName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalZoneAssets = Object.values(zoneCounts).reduce((sum, count) => sum + count, 0)
  const recordedLocations = Object.entries(zoneCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([name, count], index) => ({
      name,
      value: Math.round((count / totalZoneAssets) * 100),
      color: [
        "#0d7a8c", "#1e40af", "#7c3aed", "#dc2626", 
        "#059669", "#d97706", "#be123c", "#4338f5"
      ][index % 8]
    }))

  // Flagged reasons distribution
  const flaggedReasons = [
    { name: "Asset Lost", value: 35, color: "#dc2626" },
    { name: "Maintenance Overdue", value: 25, color: "#d97706" },
    { name: "Unauthorized Movement", value: 20, color: "#7c3aed" },
    { name: "Low Battery", value: 12, color: "#059669" },
    { name: "Geofence Violation", value: 8, color: "#1e40af" }
  ]

  return {
    stats: {
      total: totalAssets,
      toLocate: assetsToLocate,
      located: locatedAssets,
      flagged: flaggedAssets,
      underutilized: underutilizedCount,
      avgUtilization,
      totalLists: locationLists.length,
      completedLists: locationLists.filter(l => l.status === "completed").length,
      pendingLists: locationLists.filter(l => l.status === "pending").length,
      overdueLists: locationLists.filter(l => l.status === "overdue").length,
      avgCompletionRate: locationLists.length > 0 
        ? Math.round(locationLists.reduce((sum, list) => sum + list.completionPercentage, 0) / locationLists.length)
        : 0
    },
    utilization: {
      departmentUtilization,
      assetTypeUtilization,
      redistributionSuggestions,
      idleAssets,
      top10IdleAssets,
      utilizationTrend,
      maintenanceImpact,
      movementAlerts: recentMovements
    },
    monitoredCategories,
    locationTrends,
    recordedLocations,
    flaggedReasons
  }
}

// ESM-compatible direct execution check
try {
  const isDirect = import.meta.url === pathToFileURL(process.argv[1]).href
  if (isDirect) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.resolve().then(() => main())
  }
} catch {
  // noop
}

function parseArgs(): Partial<GeneratorConfig> {
  const overrides: Partial<GeneratorConfig> = {}
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.split("=")
    if (!k || v === undefined) continue
    const key = k.replace(/^--/, "") as keyof GeneratorConfig
    const num = Number(v)
    if (!Number.isNaN(num)) (overrides as any)[key] = num
  }
  // Env overrides
  if (process.env.SEED_ASSETS) overrides.assetsTotal = Number(process.env.SEED_ASSETS)
  return overrides
}

function main() {
  const overrides = parseArgs()
  const effective: GeneratorConfig = { ...DEFAULT_CONFIG, ...overrides }
  const outDir = join(process.cwd(), "data")
  const outFile = join(outDir, "seed.json")
  if (!existsSync(outDir)) mkdirSync(outDir)
  const data = generateSeed(effective)
  writeFileSync(outFile, JSON.stringify(data), { encoding: "utf-8" })
  // eslint-disable-next-line no-console
  console.log(`Generated seed at ${outFile}`)
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        counts: {
          facilities: data.facilities.length,
          departments: data.departments.length,
          buildings: data.buildings.length,
          floors: data.floors.length,
          zones: data.zones.length,
          readers: data.readers.length,
          users: data.users.length,
          assets: data.assets.length,
          movementLogs: data.movementLogs.length,
          maintenanceTasks: data.maintenanceTasks.length,
          alerts: data.alerts.length,
        },
        config: effective,
      },
      null,
      2,
    ),
  )
}

export { generateSeed }

