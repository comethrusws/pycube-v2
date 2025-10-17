import type { SeedData, Facility, Department, Building, Floor, Zone, Reader, UserGroup, User, PointOfContact, Asset, UserLog, MovementLog, MaintenanceTask, Alert, UserUtilization, OnlineStatus, AssetStatus, MaintenanceStatus, AlertType, TargetRole } from "./types"

// Deterministic PRNG for reproducible large seeds
function mulberry32(seed: number) {
  let t = seed >>> 0
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function id(prefix: string, n: number): string {
  return `${prefix}-${n.toString(36)}`
}

export function generateSeed(totalAssets: number = 20000, seed: number = 42): SeedData {
  const rng = mulberry32(seed)

  // Topology sizes (roughly):
  const facilityCount = 4
  const departmentsPerFacility = 8
  const buildingsPerFacility = 3
  const floorsPerBuilding = 5
  const zonesPerFloor = 6

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

  const facilityNames = ["North Campus", "South Campus", "East Wing", "West Wing"] as const
  const locations = ["NY", "CA", "TX", "FL", "WA", "IL"] as const
  const departmentNames = [
    "Clinical Engineering",
    "Nursing",
    "ICU",
    "Emergency",
    "Radiology",
    "Pharmacy",
    "Surgery",
    "Operations",
  ] as const

  const assetTypes = [
    "Infusion Pump",
    "Ventilator",
    "Patient Monitor",
    "Ultrasound",
    "ECG Machine",
    "X-Ray",
    "Centrifuge",
    "Telemetry Tag",
  ] as const

  const readerStatus: readonly OnlineStatus[] = ["online", "offline"] as const
  const assetStatus: readonly AssetStatus[] = ["available", "in-use", "maintenance", "lost"] as const
  const maintStatus: readonly MaintenanceStatus[] = ["pending", "in-progress", "completed"] as const
  const alertTypes: readonly AlertType[] = ["movement", "maintenance", "geofence"] as const
  const targetRoles: readonly TargetRole[] = ["biomedical", "nursing"] as const

  // Facilities, Departments, Buildings, Floors, Zones, Readers
  for (let f = 0; f < facilityCount; f++) {
    const facility: Facility = {
      id: id("fac", f),
      name: facilityNames[f % facilityNames.length],
      location: pick(rng, locations),
    }
    facilities.push(facility)

    for (let d = 0; d < departmentsPerFacility; d++) {
      departments.push({ id: id("dep", f * 100 + d), name: departmentNames[d % departmentNames.length], facilityId: facility.id })
    }

    for (let b = 0; b < buildingsPerFacility; b++) {
      const buildingId = id("bld", f * 100 + b)
      buildings.push({ id: buildingId, name: `Building ${b + 1}`, facilityId: facility.id })

      for (let fl = 0; fl < floorsPerBuilding; fl++) {
        const floorId = id("flr", f * 10000 + b * 100 + fl)
        floors.push({ id: floorId, name: `Floor ${fl + 1}`, buildingId })

        for (let z = 0; z < zonesPerFloor; z++) {
          const zoneId = id("zon", f * 100000 + b * 10000 + fl * 100 + z)
          zones.push({ id: zoneId, name: `Zone ${z + 1}`, floorId })
          // 1-2 readers per zone
          const readerCount = 1 + (rng() > 0.6 ? 1 : 0)
          for (let r = 0; r < readerCount; r++) {
            readers.push({ id: id("rd", f * 100000 + b * 10000 + fl * 100 + z * 10 + r), name: `Reader ${r + 1}`, zoneId, status: pick(rng, readerStatus) })
          }
        }
      }
    }
  }

  // User groups, users, POCs
  const groups: UserGroup[] = [
    { id: id("grp", 1), name: "Admin", permissions: ["*:"] },
    { id: id("grp", 2), name: "Biomedical", permissions: ["assets:read", "maintenance:*"] },
    { id: id("grp", 3), name: "Nursing", permissions: ["assets:read", "locator:read"] },
  ]
  userGroups.push(...groups)

  let userIdx = 0
  for (const dep of departments) {
    const userPerDep = 5
    for (let u = 0; u < userPerDep; u++) {
      const group = pick(rng, userGroups)
      users.push({
        id: id("usr", userIdx++),
        name: `User ${userIdx}`,
        role: group.name,
        groupId: group.id,
        departmentId: dep.id,
        lastLogin: new Date(Date.now() - Math.floor(rng() * 30) * 86400000).toISOString(),
      })
    }
    pointsOfContact.push({
      id: id("poc", userIdx),
      name: `POC ${userIdx}`,
      role: "Manager",
      facilityId: facilities.find((f) => f.id === buildings.find((b) => b.facilityId === dep.facilityId)?.facilityId)?.id || facilities[0].id,
      departmentId: dep.id,
      contact: `poc${userIdx}@example.org`,
    })
  }

  // Assets
  const allZones = zones
  const allDepartments = departments
  for (let a = 0; a < totalAssets; a++) {
    const zone = pick(rng, allZones)
    const floor = floors.find((fl) => fl.id === zone.floorId)!
    const building = buildings.find((b) => b.id === floor.buildingId)!
    const department = pick(rng, allDepartments)
    const status = pick(rng, assetStatus)
    const utilization = Math.floor(rng() * 100)
    const asset: Asset = {
      id: id("ast", a),
      name: `${pick(rng, assetTypes)} ${a}`,
      type: pick(rng, assetTypes),
      tagId: `TAG-${(100000 + a).toString(36).toUpperCase()}`,
      departmentId: department.id,
      location: { buildingId: building.id, floorId: floor.id, zoneId: zone.id },
      status,
      utilization,
      lastActive: new Date(Date.now() - Math.floor(rng() * 7) * 86400000).toISOString(),
      maintenanceDue: new Date(Date.now() + Math.floor(rng() * 60) * 86400000).toISOString(),
    }
    assets.push(asset)

    // Maintenance tasks roughly 20%
    if (rng() < 0.2) {
      maintenanceTasks.push({
        id: id("mnt", a),
        assetId: asset.id,
        scheduledDate: new Date(Date.now() + Math.floor(rng() * 30) * 86400000).toISOString(),
        status: pick(rng, maintStatus),
        assignedTo: pick(rng, users).id,
      })
    }

    // Movement logs 0-3 per asset
    const moves = Math.floor(rng() * 3)
    for (let m = 0; m < moves; m++) {
      const from = pick(rng, allZones)
      const to = pick(rng, allZones)
      movementLogs.push({
        id: id("mov", a * 10 + m),
        assetId: asset.id,
        fromZoneId: from.id,
        toZoneId: to.id,
        timestamp: new Date(Date.now() - Math.floor(rng() * 14) * 86400000).toISOString(),
        authorized: rng() > 0.1,
      })
    }

    // Alerts ~5%
    if (rng() < 0.05) {
      alerts.push({
        id: id("alr", a),
        type: pick(rng, alertTypes),
        targetRole: pick(rng, targetRoles),
        message: "Auto-generated alert",
        createdAt: new Date().toISOString(),
        resolved: rng() > 0.5,
      })
    }
  }

  // User logs and utilizations
  for (const user of users) {
    const sessions = 1 + Math.floor(rng() * 10)
    userUtilizations.push({ userId: user.id, sessions, avgSessionTime: Math.round(5 + rng() * 25) })
    for (let s = 0; s < sessions; s++) {
      userLogs.push({ id: id("ulog", s * 100000 + Number(user.id.split("-")[1] || 0)), userId: user.id, action: "login", timestamp: new Date(Date.now() - Math.floor(rng() * 30) * 86400000).toISOString() })
    }
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


