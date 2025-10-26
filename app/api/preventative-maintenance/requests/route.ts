import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const priority = searchParams.get("priority") || ""
    const department = searchParams.get("department") || ""

    let filteredRequests = data.maintenanceRequests || []

    // Apply filters
    if (search) {
      filteredRequests = filteredRequests.filter(request =>
        request.id.toLowerCase().includes(search.toLowerCase()) ||
        request.requestor.toLowerCase().includes(search.toLowerCase()) ||
        request.description.toLowerCase().includes(search.toLowerCase()) ||
        (request.assetName && request.assetName.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (status) {
      filteredRequests = filteredRequests.filter(request => request.status === status)
    }

    if (priority) {
      filteredRequests = filteredRequests.filter(request => request.priority === priority)
    }

    if (department) {
      filteredRequests = filteredRequests.filter(request => 
        request.department.toLowerCase().includes(department.toLowerCase())
      )
    }

    // Pagination
    const total = filteredRequests.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedRequests = filteredRequests.slice(offset, offset + limit)

    // Generate summary statistics
    const summary = {
      total: data.maintenanceRequests?.length || 0,
      pending: data.maintenanceRequests?.filter(r => r.status === "Pending").length || 0,
      inProgress: data.maintenanceRequests?.filter(r => r.status === "In Progress").length || 0,
      completed: data.maintenanceRequests?.filter(r => r.status === "Completed").length || 0,
      overdue: data.maintenanceRequests?.filter(r => r.status === "Overdue").length || 0,
      highPriority: data.maintenanceRequests?.filter(r => 
        r.priority === "High" || r.priority === "Critical"
      ).length || 0,
      totalCost: data.maintenanceRequests?.reduce((sum, r) => sum + (r.estimatedCost || 0), 0) || 0
    }

    return NextResponse.json({
      requests: paginatedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      summary
    })
  } catch (error) {
    console.error("Maintenance requests API error:", error)
    return NextResponse.json({ error: "Failed to load maintenance requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real application, this would save to database
    // For now, we'll return a success response
    const newRequestId = `MR-${Date.now().toString().slice(-3)}`
    
    return NextResponse.json({
      success: true,
      message: "Maintenance request created successfully",
      requestId: newRequestId,
      request: {
        id: newRequestId,
        ...body,
        lastModified: new Date().toISOString().split('T')[0]
      }
    })
  } catch (error) {
    console.error("Create maintenance request error:", error)
    return NextResponse.json({ error: "Failed to create maintenance request" }, { status: 500 })
  }
}
