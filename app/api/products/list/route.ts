import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const name = searchParams.get("name") || ""
    const category = searchParams.get("category") || ""
    const manufacturer = searchParams.get("manufacturer") || ""
    const status = searchParams.get("status") || ""
    const sku = searchParams.get("sku") || ""

    let filtered = data.products || []

    // Apply filters
    if (name) {
      filtered = filtered.filter(product => product.name.toLowerCase().includes(name.toLowerCase()))
    }
    if (category) {
      filtered = filtered.filter(product => product.category?.toLowerCase().includes(category.toLowerCase()))
    }
    if (manufacturer) {
      filtered = filtered.filter(product => product.manufacturer?.toLowerCase().includes(manufacturer.toLowerCase()))
    }
    if (status) {
      filtered = filtered.filter(product => product.status === status)
    }
    if (sku) {
      filtered = filtered.filter(product => product.sku?.toLowerCase().includes(sku.toLowerCase()))
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedData = filtered.slice(offset, offset + limit)

    // Add asset count for each product
    const enrichedData = paginatedData.map(product => ({
      ...product,
      totalAssets: data.assets.filter(asset => asset.productId === product.id).length
    }))

    return NextResponse.json({
      products: enrichedData,
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
    console.error("Products list API error:", error)
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }
}
