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
  Alert,
  UserUtilization,
  Status,
  MaintenanceStatus,
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
  const assets: Asset[] = []
  const userLogs: UserLog[] = []
  const movementLogs: MovementLog[] = []
  const maintenanceTasks: MaintenanceTask[] = []
  const alerts: Alert[] = []
  const userUtilizations: UserUtilization[] = []

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
      tagId: isTagged ? `TAG-${(a + 1).toString().padStart(6, "0")}` : "",
      departmentId,
      location: { buildingId, floorId, zoneId },
      status,
      utilization: status === "in-use" ? randomInt(60, 95) : status === "available" ? randomInt(10, 40) : randomInt(0, 20),
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
      
      maintenanceTasks.push({
        id: randomUUID(),
        assetId: asset.id,
        type: randomChoice(["preventive", "corrective", "calibration", "inspection"]),
        description: `${randomChoice(["Routine", "Emergency", "Scheduled"])} maintenance for ${asset.name}`,
        scheduledDate: randomDateISO(selectedStatus === "overdue" ? 30 : -60),
        completedDate: selectedStatus === "completed" ? randomDateISO(7) : undefined,
        status: selectedStatus,
        assignedTo: randomChoice(users.filter(u => u.role === "biomedical" || u.role === "technician")).id,
        priority: randomChoice(["low", "medium", "high", "critical"]),
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

  // Link assets to departments
  const deptById = new Map(departments.map((d) => [d.id, d]))
  for (const asset of assets) {
    const d = deptById.get(asset.departmentId)
    if (d) d.assets.push(asset)
  }

  // Generate dashboard aggregated data
  const dashboardData = generateDashboardData(assets, maintenanceTasks, movementLogs, zones, users)

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
    assets,
    userLogs,
    movementLogs,
    maintenanceTasks,
    alerts,
    userUtilizations,
    dashboardData, // Add aggregated dashboard data
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

