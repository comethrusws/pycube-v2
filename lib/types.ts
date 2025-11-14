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
  productId?: string
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
    avgUtilization: number
    underutilizedAssets: number
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
  dashboardCards: {
    assetProtection: {
      protectedAssets: number
      activeGeofences: number 
      violationsToday: number
      avgResponseTime: number
      // Second row cards
      highRiskAssets: number
      complianceScore: number
      alertsThisWeek: number
      falsePositiveRate: number
    }
    assetInsights: {
      assetTagged: number
      assetUntagged: number
      percentTagged: number
      assetsNotFound: number
      assetsInUse: number
      assetsFound: number
      zonesNotScannedCount: number
      recentAssets: Array<{
        id: string
        name: string
        type: string
        location: string
        status: string
        lastActive: string
      }>
      topCategories: Array<{
        name: string
        count: number
      }>
      // Visibility data
      scanned: number
      notScanned: number
      visibilityTrend: Array<{
        date: string
        scanned: number
        notScanned: number
      }>
    }
    compliance: {
      complianceScore: number
      fullyCompliantAssets: number
      totalCompliantAssets: number
      avgRiskScore: number
      // Risk Distribution data
      highRiskAssets: number
      mediumRiskAssets: number
      lowRiskAssets: number
    }
    preventativeMaintenance: {
      totalMonitoredAssets: number
      highRiskAssets: number
      pmTasksCompleted: number
      potentialSavings: number
      // Predictive Maintenance Insights
      assetsMonitoredPredictive: number
      highRiskAssetsPredictive: number
      avgConfidence: number
      costSavings: number
    }
    assetUtilization: {
      avgUtilization: number
      underutilizedAssets: number
      movementAlerts: number
      idleCriticalAssets: number
      // Location overview data from asset utilization dashboard
      totalMonitoredAssets: number
      assetsToLocate: number
      totalAssetsLocated: number
      totalAssetsFlagged: number
    }
    spaceManagement: {
      totalFloors: number
      totalZones: number
      readersOnline: number
      readersOffline: number
      assetsInUse: number
      assetsAvailable: number
    }
  }
  assetDetails: {
    recentAssets: { id: string; name: string; type: string; location: string; status: string; lastActive: string }[]
    topCategories: { name: string; count: number }[]
    maintenanceDue: { id: string; assetId: string; name: string; dueDate: string; type: string }[]
  }
  utilization: {
    departmentUtilization: DepartmentUtilization[]
    top5IdleAssets: Top10IdleAsset[]
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
  products: Product[]
  productCategories: ProductCategory[]
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
  complianceData?: ComplianceData
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

// Products and Categories
export interface ProductCategory {
  id: string
  name: string
  status: "active" | "inactive"
  parentCategoryId?: string
  description?: string
  createdAt?: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  category?: string
  manufacturer?: string
  status?: "active" | "inactive"
  sku?: string
  createdAt?: string
  updatedAt?: string
  price?: number
  description?: string
}

// Compliance & Risk
export interface ComplianceAssetRisk {
  assetId: string
  assetName: string
  departmentId: string
  departmentName: string
  missedMaintenance: number
  overdueCalibration: number
  recallFlag: boolean
  riskScore: number // 0-100
}

export interface ComplianceSummary {
  overallScore: number
  totalAssets: number
  fullyCompliant: number
  overdueMaintenance: number
  recallActions: number
  averageRiskScore: number
  riskByDepartment: { departmentId: string; departmentName: string; high: number; medium: number; low: number }[]
  noncomplianceTrend: { date: string; noncompliant: number }[]
}

export interface ComplianceData {
  summary: ComplianceSummary
  assetRisks: ComplianceAssetRisk[]
}

// Add mobile-specific asset interfaces
export interface MobileAsset {
  id: string
  name: string
  type: string
  category: string
  tagId: string
  status: Status
  utilization: number
  lastActive: string
  department: string
  departmentId: string
  location: {
    building: string
    floor: string
    zone: string
    room: string
    coordinates: { x: number; y: number }
  }
  maintenanceReadiness: "green" | "yellow" | "red"
  lastSeen: string
  serialNumber?: string
  value?: number
}

export interface MobileSearchFilters {
  departments: string[]
  buildings: string[]
  floors: string[]
  types: string[]
  statuses: string[]
}

// Add mobile-specific pagination and summary interfaces
export interface MobilePaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface MobileAssetSummary {
  totalAssets: number
  availableAssets: number
  inUseAssets: number
  maintenanceAssets: number
  lostAssets: number
  recentlyActive: number
  departmentCounts: { department: string; count: number }[]
  typeCounts: { type: string; count: number }[]
}

export interface AssetAction {
  assetId: string
  action: "retrieve" | "report_missing" | "maintenance_request" | "locate"
  userId: string
  notes?: string
  timestamp?: string
}

export interface AssetActionResponse {
  success: boolean
  message: string
  updatedAsset?: Asset
  logs?: any[]
  alert?: Alert
  maintenanceRequest?: MaintenanceRequest
  location?: {
    building?: string
    floor?: string
    zone?: string
    coordinates?: { x: number; y: number }
  }
}

// Asset Protection Module Types
export interface GeofenceZone {
  id: string
  name: string
  description?: string
  type: "restricted" | "authorized" | "high-security" | "maintenance-only"
  zoneIds: string[] // Array of zone IDs that make up this geofence
  assetIds: string[] // Assets assigned to this geofence
  priority: "low" | "medium" | "high" | "critical"
  active: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
  alertOnEntry: boolean
  alertOnExit: boolean
  allowedRoles: string[] // User roles allowed in this geofence
  workingHours?: {
    enabled: boolean
    startTime: string // HH:MM format
    endTime: string // HH:MM format
    daysOfWeek: number[] // 0-6, Sunday = 0
  }
  coordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface GeofenceViolation {
  id: string
  geofenceZoneId: string
  geofenceZoneName: string
  assetId: string
  assetName: string
  assetType: string
  violationType: "entry" | "exit" | "unauthorized_presence" | "after_hours"
  severity: "low" | "medium" | "high" | "critical"
  timestamp: string
  fromZoneId: string
  fromZoneName: string
  toZoneId: string
  toZoneName: string
  detectedBy?: string // Reader or system that detected
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
  status: "active" | "investigating" | "resolved" | "false_positive"
  alertSent: boolean
  alertRecipients: string[]
  responseTime?: number // Minutes to respond
  actionTaken?: string
  estimatedRisk: number // 1-10 risk score
}

export interface AssetProtectionAlert {
  id: string
  type: "geofence_violation" | "movement_anomaly" | "theft_risk" | "unauthorized_access" | "asset_missing"
  assetId: string
  assetName: string
  assetType: string
  assetValue?: number
  message: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  status: "new" | "acknowledged" | "investigating" | "resolved"
  createdAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
  targetRoles: TargetRole[]
  location: {
    buildingId: string
    buildingName: string
    floorId: string
    floorName: string
    zoneId: string
    zoneName: string
  }
  relatedIds?: {
    geofenceZoneId?: string
    violationId?: string
    movementLogId?: string
  }
  metadata?: {
    riskScore: number
    confidence: number
    patternMatch?: string
    triggerCondition?: string
  }
  actionRequired: boolean
  urgency: "immediate" | "within_hour" | "within_day" | "routine"
  estimatedImpact: "minimal" | "moderate" | "significant" | "critical"
}

export interface AssetMovementPattern {
  id: string
  assetId: string
  assetName: string
  assetType: string
  patternType: "normal" | "unusual" | "suspicious" | "emergency"
  description: string
  detectedAt: string
  confidence: number // 0-100%
  riskLevel: "low" | "medium" | "high" | "critical"
  movements: {
    timestamp: string
    fromZoneId: string
    fromZoneName: string
    toZoneId: string
    toZoneName: string
    duration: number // minutes spent in zone
    velocity?: number // movement speed if available
  }[]
  anomalyIndicators: {
    afterHours: boolean
    unauthorizedZones: boolean
    rapidMovement: boolean
    patternDeviation: boolean
    frequencyAnomaly: boolean
  }
  alertGenerated: boolean
  reviewStatus: "pending" | "reviewed" | "cleared" | "escalated"
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

export interface AssetProtectionMetrics {
  totalProtectedAssets: number
  activeGeofences: number
  violationsToday: number
  violationsThisWeek: number
  violationsThisMonth: number
  highValueAssetsAtRisk: number
  averageResponseTime: number // minutes
  falsePositiveRate: number // percentage
  alertsGenerated: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  complianceScore: number // percentage
  fullyCompliantAssets: number
  totalMonitoredAssets: number
  topViolationTypes: {
    type: string
    count: number
    percentage: number
  }[]
  violationTrend: {
    date: string
    violations: number
    resolved: number
  }[]
  geofenceEffectiveness: {
    zoneId: string
    zoneName: string
    violationCount: number
    responseRate: number
    averageResponseTime: number
  }[]
}

export interface AssetProtectionDashboardData {
  metrics: AssetProtectionMetrics
  recentViolations: GeofenceViolation[]
  activeAlerts: AssetProtectionAlert[]
  movementPatterns: AssetMovementPattern[]
  riskAssets: {
    assetId: string
    assetName: string
    assetType: string
    value: number
    riskScore: number
    location: string
    lastViolation?: string
    violationCount: number
  }[]
  protectionCoverage: {
    departmentId: string
    departmentName: string
    totalAssets: number
    protectedAssets: number
    coverage: number // percentage
    violations: number
  }[]
}

