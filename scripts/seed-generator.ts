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
  assetsTotal: 18000, // > 16k as requested
  usersPerDepartment: 12,
  maintenanceTaskPerAssetRatio: 0.2,
  movementLogsPerAsset: 2,
}

const ASSET_TYPES = [
  "Infusion Pump",
  "Centrifuge",
  "ECG Monitor",
  "Ventilator",
  "Ultrasound",
  "X-Ray",
  "Defibrillator",
  "Patient Monitor",
  "Syringe Pump",
  "Telemetry Transmitter",
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

  const taggingRate = 0.3 // 30% tagged

  for (let a = 0; a < DEFAULT_CONFIG.assetsTotal; a++) {
    const zoneId = randomChoice(allZones)
    const floorId = zoneToFloor.get(zoneId) as string
    const buildingId = floorToBuilding.get(floorId) as string
    const facilityId = buildingToFacility.get(buildingId) as string
    const deptIds = facilityToDepartments.get(facilityId) as string[]
    const departmentId = randomChoice(deptIds)

    const status = randomChoice(statusPool)
    const isTagged = Math.random() < taggingRate
    const type = randomChoice(ASSET_TYPES)
    const lastActiveDays = status === "in-use" ? randomInt(0, 3) : status === "available" ? randomInt(0, 14) : randomInt(7, 60)

    const asset: Asset = {
      id: randomUUID(),
      name: `${type} #${a + 1}`,
      type,
      tagId: isTagged ? `TAG-${(a + 1).toString().padStart(6, "0")}` : "",
      departmentId,
      location: { buildingId, floorId, zoneId },
      status,
      utilization: status === "in-use" ? randomInt(40, 95) : status === "available" ? randomInt(5, 40) : randomInt(0, 20),
      lastActive: randomDateISO(lastActiveDays),
      maintenanceDue: status === "maintenance" ? randomDateISO(15) : randomDateISO(120),
    }
    assets.push(asset)

    // Movement logs
    for (let m = 0; m < DEFAULT_CONFIG.movementLogsPerAsset; m++) {
      const toZoneId = randomChoice(allZones)
      movementLogs.push({
        id: randomUUID(),
        assetId: asset.id,
        fromZoneId: zoneId,
        toZoneId,
        timestamp: randomDateISO(m === 0 ? lastActiveDays : randomInt(3, 90)),
        authorized: Math.random() > 0.1,
      })
    }

    // Maintenance tasks
    if (Math.random() < DEFAULT_CONFIG.maintenanceTaskPerAssetRatio) {
      const statuses: MaintenanceStatus[] = ["pending", "in-progress", "completed"]
      maintenanceTasks.push({
        id: randomUUID(),
        assetId: asset.id,
        scheduledDate: randomDateISO(120),
        status: randomChoice(statuses),
        assignedTo: randomChoice(users).id,
      })
    }

    // Alerts occasionally
    if (Math.random() < 0.05) {
      const types: Alert["type"][] = ["movement", "maintenance", "geofence"]
      alerts.push({
        id: randomUUID(),
        type: randomChoice(types),
        targetRole: Math.random() < 0.5 ? "biomedical" : "nursing",
        message: "Automated alert",
        createdAt: randomDateISO(30),
        resolved: Math.random() < 0.6,
      })
    }
  }

  // Link assets to departments
  const deptById = new Map(departments.map((d) => [d.id, d]))
  for (const asset of assets) {
    const d = deptById.get(asset.departmentId)
    if (d) d.assets.push(asset)
  }

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
  }
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

export { generateSeed }

