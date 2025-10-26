# SYSTEM_DESIGN.md

## 1. Overview

This system is a **Healthcare Asset Management Platform** built as a proof of concept (POC) in **Next.js 15**.
The platform digitizes hospital asset visibility, utilization, and protection through modular components.
It uses **mock APIs backed by a seed JSON** (no database). All data operations occur in-memory.

---

## 2. Objectives

* Centralize real-time asset visibility across facilities.
* Automate maintenance and utilization tracking.
* Improve accountability through role-based logs.
* Provide AI-assisted recommendations for asset redistribution and maintenance planning.
* Ensure security with geofencing and movement monitoring.

---

## 3. Architecture

### 3.1 Stack

* **Frontend / Backend:** Next.js 15 (App Router)
* **Data Source:** Static seed JSON
* **API Layer:** Next.js Route Handlers
* **State Management:** SWR or React Query (client-side caching)
* **Language:** TypeScript

### 3.2 Logical Structure

```
Client (UI)
   ↓
API Layer (Mock REST APIs)
   ↓
Data Layer (seed.json loaded into memory)
```

Each module reads and mutates the shared in-memory data object.
In production, this would be replaced by a real database (e.g., PostgreSQL or MongoDB).

---

## 4. Modules Overview

### 4.1 Core Module

**Purpose:** Central command center for administrators.

* **Dashboard:** Shows asset stats, utilization trends, and recent activity.
* **AI Assistant:** Provides insights and recommendations (mocked using static logic).
* **User Logs:** Tracks user actions for accountability.
* **User Utilization:** Measures engagement and adoption.

### 4.2 Onboarding (Setup) Module

**Purpose:** Bootstraps system data and permissions.

* Facilities setup
* Departments definition
* User groups and roles
* Users management
* Points of contact
* Role-based access
* Asset tagging
* Maps for visual asset placement

### 4.3 Space Management Module

**Purpose:** Structurally organizes facility geography.

* Buildings → Floors → Zones hierarchy
* RFID readers for tracking coverage

### 4.4 Asset Locator Module

**Purpose:** Enables instant asset search and retrieval with advanced utilization analytics.

* **Live locator** for real-time asset positions
* **Dynamic utilization dashboard** with interactive monitoring capabilities
* **Asset detail modals** with comprehensive information and action buttons
* **Bulk asset management** with selection and batch operations
* **Interactive monitoring setup** with configurable alerts and tracking
* **Search and filtering** capabilities across all asset data
* **Click-through navigation** from dashboard charts to detailed asset views
* **Maintenance integration** showing impact on asset availability
* **Movement alert system** with real-time notifications from Asset Protection module

### 4.5 Preventive Maintenance Module

**Purpose:** Keeps assets operational with both traditional and AI-powered maintenance strategies.

* **Traditional Dashboard** for task overview and scheduling
* **Predictive Maintenance Insights** - AI-driven failure prediction system with:
  * Risk assessment algorithms based on asset age, utilization, and maintenance history
  * Interactive prediction timeline charts with color-coded risk levels
  * Top 5 at-risk assets table with maintenance scheduling capabilities
  * Degradation trend analysis and visualization
  * Cost savings projections from prevented failures
  * Modal-based maintenance scheduling with form validation
* Automated maintenance schedules and alerts
* Integration with Asset Protection module for movement-based maintenance triggers
* Export capabilities for predictive insights and maintenance reports

### 4.6 Asset Protection Module

**Purpose:** Prevents loss and misuse.

* Dashboard for protection metrics
* Geofencing of high-value assets
* Movement logs
* Alerts for unauthorized movement

---

## 5. Data Model

### 5.1 Entity Relationship Summary

| Entity          | Relationships                                                           |
| --------------- | ----------------------------------------------------------------------- |
| Facility        | Has many Departments, Buildings, PointsOfContact                        |
| Department      | Belongs to Facility, has many Assets, Users                             |
| Building        | Belongs to Facility, has many Floors                                    |
| Floor           | Belongs to Building, has many Zones                                     |
| Zone            | Belongs to Floor, has many Readers and Assets                           |
| Reader          | Belongs to Zone                                                         |
| Asset           | Belongs to Department and Zone, has many MovementLogs, MaintenanceTasks |
| UserGroup       | Has many Users                                                          |
| User            | Belongs to Department and UserGroup, creates UserLogs                   |
| MaintenanceTask | Belongs to Asset                                                        |
| MovementLog     | Belongs to Asset                                                        |
| Alert           | Linked to Asset or Department                                           |

---

### 5.2 Data Schema (Conceptual Model)

```ts
// Core Entities
Facility {
  id: string
  name: string
  location: string
  departments: Department[]
  buildings: Building[]
}

Department {
  id: string
  name: string
  facilityId: string
  users: User[]
  assets: Asset[]
}

Building {
  id: string
  name: string
  facilityId: string
  floors: Floor[]
}

Floor {
  id: string
  name: string
  buildingId: string
  zones: Zone[]
}

Zone {
  id: string
  name: string
  floorId: string
  readers: Reader[]
}

Reader {
  id: string
  name: string
  zoneId: string
  status: "online" | "offline"
}

// Onboarding
UserGroup {
  id: string
  name: string
  permissions: string[]
}

User {
  id: string
  name: string
  role: string
  groupId: string
  departmentId: string
  lastLogin: string
}

PointOfContact {
  id: string
  name: string
  role: string
  facilityId: string
  departmentId: string
  contact: string
}

// Assets
Asset {
  id: string
  name: string
  type: string
  tagId: string
  departmentId: string
  location: {
    buildingId: string
    floorId: string
    zoneId: string
  }
  status: "available" | "in-use" | "maintenance" | "lost"
  utilization: number
  lastActive: string
  maintenanceDue: string
}

// Logs
UserLog {
  id: string
  userId: string
  action: string
  timestamp: string
}

MovementLog {
  id: string
  assetId: string
  fromZoneId: string
  toZoneId: string
  timestamp: string
  authorized: boolean
}

// Maintenance
MaintenanceTask {
  id: string
  assetId: string
  scheduledDate: string
  status: "pending" | "in-progress" | "completed"
  assignedTo: string
}

// Alerts
Alert {
  id: string
  type: "movement" | "maintenance" | "geofence"
  targetRole: "biomedical" | "nursing"
  message: string
  createdAt: string
  resolved: boolean
}

// Analytics
UserUtilization {
  userId: string
  sessions: number
  avgSessionTime: number
}
```

---

## 6. Data Flow Example (Core Dashboard)

1. UI calls `/api/core/dashboard`.
2. Handler reads `data.assets` from memory.
3. Computes:

   * Total asset count
   * % utilization
   * Assets under maintenance
   * Recent movement or maintenance logs
4. Returns structured JSON for dashboard cards and charts.

This flow pattern is consistent across modules.

---

## 7. Security and Access (Mocked)

* **Role-Based Access Control (RBAC)** simulated via `UserGroup.permissions`.
* Each API route checks permissions before performing operations.
* Sensitive actions (like editing facility or deleting assets) restricted to admins.

---

## 8. Scalability Roadmap

| POC (Now)           | Future (Production)                |
| ------------------- | ---------------------------------- |
| Static seed.json    | PostgreSQL or MongoDB              |
| Mock AI assistant   | Real ML-powered recommendation API |
| Local-only access   | JWT + Role-based Auth              |
| Basic logs          | Audit logs with Kafka/EventStream  |

---

