import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Filter parameters
    const listId = searchParams.get("listId") || ""
    const listName = searchParams.get("listName") || ""
    const status = searchParams.get("status") || ""
    const assignedGroup = searchParams.get("assignedGroup") || ""
    const createdBy = searchParams.get("createdBy") || ""

    let filteredLists = data.locationLists || []

    // Apply filters
    if (listId) {
      filteredLists = filteredLists.filter(list => 
        list.listId.toLowerCase().includes(listId.toLowerCase())
      )
    }
    
    if (listName) {
      filteredLists = filteredLists.filter(list => 
        list.listName.toLowerCase().includes(listName.toLowerCase())
      )
    }
    
    if (status) {
      filteredLists = filteredLists.filter(list => list.status === status)
    }
    
    if (assignedGroup) {
      filteredLists = filteredLists.filter(list => 
        list.assignedGroup.toLowerCase().includes(assignedGroup.toLowerCase())
      )
    }
    
    if (createdBy) {
      filteredLists = filteredLists.filter(list => 
        list.createdBy.toLowerCase().includes(createdBy.toLowerCase())
      )
    }

    // Sort by creation date (newest first)
    filteredLists.sort((a, b) => 
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    )

    const total = filteredLists.length
    const paginatedLists = filteredLists.slice(offset, offset + limit)

    // Format dates for display
    const formattedLists = paginatedLists.map(list => ({
      ...list,
      assetCount: list.assetIds?.length || 0,
      createdDate: new Date(list.createdDate).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }),
      targetCompletionDate: new Date(list.targetCompletionDate).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
      }),
      completedDate: list.completedDate 
        ? new Date(list.completedDate).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
          })
        : ""
    }))

    return NextResponse.json({
      data: formattedLists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1
      },
      filters: {
        listId,
        listName,
        status,
        assignedGroup,
        createdBy
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
