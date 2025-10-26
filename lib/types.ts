export type Status = "available" | "in-use" | "maintenance" | "lost"
export type MaintenanceStatus = "pending" | "in-progress" | "completed" | "overdue"

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
  category?: string // Add category field
  tagId: string
  departmentId: string
  location: {
    buildingId: string
    floorId: string
    zoneId: string
  }
  status: Status
  utilization: number
  lastActive: string
  maintenanceDue: string
  serialNumber?: string // Add serial number
  purchaseDate?: string // Add purchase date
  warrantyExpiry?: string // Add warranty expiry
  value?: number // Add asset value
}

export interface MovementLog {
  id: string
  assetId: string
  fromZoneId: string
  toZoneId: string
  timestamp: string
  authorized: boolean
  movedBy?: string // Add who moved it
  reason?: string // Add reason for movement
}

export interface MaintenanceTask {
  id: string
  assetId: string
  type?: string // Add maintenance type
  description?: string // Add description
  scheduledDate: string
  completedDate?: string // Add completion date
  status: MaintenanceStatus
  assignedTo: string
  priority?: string // Add priority
  estimatedDuration?: number // Add estimated duration in minutes
  cost?: number // Add estimated/actual cost
}

export interface MaintenanceRequest {
  id: string
  status: string
  requestor: string
  category: string
  priority: string
  urgency: string
  department: string
  description: string
  maintenanceDate: string
  businessCriticality: string
  lastModified: string
  assetName?: string
  assetId?: string
  estimatedCost?: number
  createdBy: string
  assignedTo?: string
}

export type AlertType = "movement" | "maintenance" | "geofence" | "utilization" | "battery"
export type TargetRole = "biomedical" | "nursing" | "admin"

export interface Alert {
  id: string
  type: AlertType
  assetId?: string // Link to specific asset
  targetRole: TargetRole
  message: string
  severity?: "low" | "medium" | "high" | "critical" // Add severity
  createdAt: string
  resolved: boolean
  resolvedAt?: string // Add resolution timestamp
  resolvedBy?: string // Add who resolved it
}

export interface UserUtilization {
  userId: string
  sessions: number
  avgSessionTime: number
  totalTime?: number // Add total time spent
  lastActivity?: string // Add last activity timestamp
  featuresUsed?: string[] // Add features used
}

export interface UserLog {
  id: string
  userId: string
  action: string
  details?: string // Add action details
  timestamp: string
  ipAddress?: string // Add IP address
  userAgent?: string // Add user agent
}

export interface DashboardData {
  stats: {
    totalAssets: number
    totalFacilities: number
    totalUsers: number
    categories: number
  }
  tagging: {
    tagged: number
    untagged: number
    percentTagged: number
  }
  overview: {
    notFound: number
    inUse: number
    found: number
  }
  visibility: {
    scanned: number
    notScanned: number
    trend: { date: string; scanned: number; notScanned: number }[]
  }
  zonesNotScanned: string[]
  assetDetails: {
    recentAssets: { id: string; name: string; type: string; location: string; status: string; lastActive: string }[]
    topCategories: { name: string; count: number }[]
    maintenanceDue: { id: string; assetId: string; name: string; dueDate: string; type: string }[]
  }
}

export interface LocationList {
  id: string
  listId: string
  listName: string
  createdDate: string
  targetCompletionDate: string
  completedDate?: string
  createdBy: string
  assignedGroup: string
  assetIds: string[]
  updatedBy: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high" | "critical"
  description?: string
  completionPercentage: number
}

export interface LocationActivity {
  id: string
  locationListId: string
  assetId: string
  action: "scanned" | "located" | "flagged" | "updated"
  timestamp: string
  performedBy: string
  notes?: string
  location?: {
    zoneId: string
    zoneName: string
  }
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
  maintenanceRequests: MaintenanceRequest[]
  alerts: Alert[]
  userUtilizations: UserUtilization[]
  locationLists: LocationList[]
  locationActivities: LocationActivity[]
  dashboardData?: any
  assetLocatorData?: any
  predictiveMaintenanceData?: PredictiveMaintenanceData // Add predictive maintenance data
}

// Add new interfaces for utilization analytics
export interface DepartmentUtilization {
  departmentId: string
  departmentName: string
  avgUtilization: number
  totalAssets: number
  underutilized: number
  active: number
  idle: number
  inMaintenance: number
  utilizationTrend: { date: string; utilization: number }[]
}

export interface AssetTypeUtilization {
  type: string
  avgUtilization: number
  totalAssets: number
  underutilized: number
  utilizationRate: number
}

export interface RedistributionSuggestion {
  id: string
  assetId: string
  assetName: string
  assetType: string
  currentUtilization: number
  fromDepartment: string
  fromDepartmentId: string
  toDepartment: string
  toDepartmentId: string
  potentialImpact: string
  priority: "high" | "medium" | "low"
  estimatedSavings: number
  reason: string
}

export interface IdleAsset {
  id: string
  name: string
  type: string
  utilization: number
  location: string
  departmentId: string
  lastActive: string
  idleDays: number
}

export interface Top10IdleAsset {
  id: string
  name: string
  type: string
  department: string
  departmentId: string
  utilization: number
  location: string
  lastUsed: string
  idleDuration: number
  recommendedAction: string
  value: number
  status: string
}

export interface UtilizationTrendPoint {
  date: string
  displayDate: string
  utilization: number
  maintenanceEvents: number
  tooltip: string | null
}

export interface MaintenanceImpactData {
  name: string
  value: number
  count: number
  color: string
}

export interface MovementAlert {
  id: string
  assetId: string
  assetName: string
  assetType: string
  fromLocation: string
  toLocation: string
  timestamp: string
  alertType: string
  severity: "low" | "medium" | "high"
  status: "pending" | "resolved"
  movedBy: string
}

export interface UtilizationAnalytics {
  departmentUtilization: DepartmentUtilization[]
  assetTypeUtilization: AssetTypeUtilization[]
  redistributionSuggestions: RedistributionSuggestion[]
  idleAssets: IdleAsset[]
  top10IdleAssets: Top10IdleAsset[]
  utilizationTrend: UtilizationTrendPoint[]
  maintenanceImpact: MaintenanceImpactData[]
  movementAlerts: MovementAlert[]
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
// Add new interfaces for predictive maintenance analytics
export interface PredictiveInsight {
  id: string
  assetId: string
  assetName: string
  assetType: string
  location: string
  departmentId: string
  predictedFailureWindow: number // days remaining
  confidenceScore: number // percentage
  riskLevel: "low" | "medium" | "high"
  predictedIssue: string
  keyIndicators: {
    usageHours: number
    temperatureVariance: number
    vibrationLevels: number
    performanceDegradation: number
  }
  maintenanceHistory: {
    lastServiceDate: string
    nextScheduledService: string
    serviceCount: number
    avgServiceInterval: number
  }
  degradationScore: number
  recommendedAction: string
  createdAt: string
}

export interface DegradationTrend {
  date: string
  degradationScore: number
  usageHours: number
  performanceIndex: number
}

export interface PredictiveMaintenanceData {
  summary: {
    totalAssetsMonitored: number
    highRiskAssets: number
    mediumRiskAssets: number
    lowRiskAssets: number
    avgConfidenceScore: number
    potentialCostSavings: number
  }
  insights: PredictiveInsight[]
  top5AtRisk: PredictiveInsight[]
  riskDistribution: { name: string; value: number; count: number; color: string }[]
  degradationTrends: { assetId: string; assetName: string; trend: DegradationTrend[] }[]
  predictionAccuracy: { month: string; accuracy: number; predictionsCount: number }[]
}

