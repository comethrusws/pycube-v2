export type Status = "available" | "in-use" | "maintenance" | "lost"

export interface Facility {
  id: string
  name: string
  location: string
  departments: Department[]
  buildings: Building[]
}

export interface Department {
  id: string
  name: string
  facilityId: string
  users: User[]
  assets: Asset[]
}

export interface Building {
  id: string
  name: string
  facilityId: string
  floors: Floor[]
}

export interface Floor {
  id: string
  name: string
  buildingId: string
  zones: Zone[]
}

export interface Zone {
  id: string
  name: string
  floorId: string
  readers: Reader[]
}

export interface Reader {
  id: string
  name: string
  zoneId: string
  status: "online" | "offline"
}

export interface UserGroup {
  id: string
  name: string
  permissions: string[]
}

export interface User {
  id: string
  name: string
  role: string
  groupId: string
  departmentId: string
  lastLogin: string
}

export interface PointOfContact {
  id: string
  name: string
  role: string
  facilityId: string
  departmentId: string
  contact: string
}

export interface AssetLocationRef {
  buildingId: string
  floorId: string
  zoneId: string
}

export interface Asset {
  id: string
  name: string
  type: string
  tagId: string
  departmentId: string
  location: AssetLocationRef
  status: Status
  utilization: number
  lastActive: string
  maintenanceDue: string
}

export interface UserLog {
  id: string
  userId: string
  action: string
  timestamp: string
}

export interface MovementLog {
  id: string
  assetId: string
  fromZoneId: string
  toZoneId: string
  timestamp: string
  authorized: boolean
}

export type MaintenanceStatus = "pending" | "in-progress" | "completed"

export interface MaintenanceTask {
  id: string
  assetId: string
  scheduledDate: string
  status: MaintenanceStatus
  assignedTo: string
}

export type AlertType = "movement" | "maintenance" | "geofence"
export type TargetRole = "biomedical" | "nursing"

export interface Alert {
  id: string
  type: AlertType
  targetRole: TargetRole
  message: string
  createdAt: string
  resolved: boolean
}

export interface UserUtilization {
  userId: string
  sessions: number
  avgSessionTime: number
}

export interface SeedData {
  facilities: Facility[]
  departments: Department[]
  buildings: Building[]
  floors: Floor[]
  zones: Zone[]
  readers: Reader[]
  userGroups: UserGroup[]
  users: User[]
  pointsOfContact: PointOfContact[]
  assets: Asset[]
  userLogs: UserLog[]
  movementLogs: MovementLog[]
  maintenanceTasks: MaintenanceTask[]
  alerts: Alert[]
  userUtilizations: UserUtilization[]
}

export interface GeneratorConfig {
  facilityCount: number
  buildingsPerFacility: number
  floorsPerBuilding: number
  zonesPerFloor: number
  readersPerZone: number
  departmentsPerFacility: number
  assetsTotal: number
  usersPerDepartment: number
  maintenanceTaskPerAssetRatio: number
  movementLogsPerAsset: number
}

