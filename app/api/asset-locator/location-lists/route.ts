import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const listId = searchParams.get("listId") || ""
    const listName = searchParams.get("listName") || ""
    const status = searchParams.get("status") || ""
    const assignedGroup = searchParams.get("assignedGroup") || ""
    const createdBy = searchParams.get("createdBy") || ""

    let filtered = data.locationLists || []

    // Apply filters
    if (listId) {
      filtered = filtered.filter(list => list.listId.toLowerCase().includes(listId.toLowerCase()))
    }
    if (listName) {
      filtered = filtered.filter(list => list.listName.toLowerCase().includes(listName.toLowerCase()))
    }
    if (status) {
      filtered = filtered.filter(list => list.status === status)
    }
    if (assignedGroup) {
      filtered = filtered.filter(list => list.assignedGroup.toLowerCase().includes(assignedGroup.toLowerCase()))
    }
    if (createdBy) {
      filtered = filtered.filter(list => list.createdBy.toLowerCase().includes(createdBy.toLowerCase()))
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedData = filtered.slice(offset, offset + limit)

    // Add asset count to each location list
    const enrichedData = paginatedData.map(list => ({
      ...list,
      assetCount: list.assetIds?.length || 0,
      createdDate: new Date(list.createdDate).toLocaleDateString(),
      targetCompletionDate: new Date(list.targetCompletionDate).toLocaleDateString(),
      completedDate: list.completedDate ? new Date(list.completedDate).toLocaleDateString() : null
    }))

    return NextResponse.json({
      locationLists: enrichedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error("Location lists API error:", error)
    return NextResponse.json({ error: "Failed to load location lists" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await loadSeedData()
    
    // In a real application, this would create a new location list
    // For now, we'll return a success response
    
    const newListId = `LOC${(data.locationLists.length + 1).toString().padStart(4, "0")}`
    
    return NextResponse.json({
      success: true,
      message: "Location list created successfully",
      listId: newListId
    })
  } catch (error) {
    console.error("Create location list error:", error)
    return NextResponse.json({ error: "Failed to create location list" }, { status: 500 })
  }
}
