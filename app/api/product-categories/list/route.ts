import { NextRequest, NextResponse } from "next/server"
import { loadSeedData } from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const data = await loadSeedData()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const name = searchParams.get("name") || ""
    const status = searchParams.get("status") || ""
    const parentCategory = searchParams.get("parentCategory") || ""

    let filtered = data.productCategories || []

    // Apply filters
    if (name) {
      filtered = filtered.filter(category => category.name.toLowerCase().includes(name.toLowerCase()))
    }
    if (status) {
      filtered = filtered.filter(category => category.status === status)
    }
    if (parentCategory) {
      filtered = filtered.filter(category => {
        const parent = data.productCategories.find(p => p.id === category.parentCategoryId)
        return parent?.name.toLowerCase().includes(parentCategory.toLowerCase())
      })
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedData = filtered.slice(offset, offset + limit)

    // Enrich data with parent category info and counts
    const enrichedData = paginatedData.map(category => {
      const parentCategory = data.productCategories.find(p => p.id === category.parentCategoryId)
      const totalProducts = data.products.filter(product => product.categoryId === category.id).length
      const totalAssets = data.assets.filter(asset => {
        const product = data.products.find(p => p.id === asset.productId)
        return product?.categoryId === category.id
      }).length
      
      return {
        ...category,
        parentCategoryName: parentCategory?.name,
        totalProducts,
        totalAssets,
        level: category.parentCategoryId ? 1 : 0 // Simple level calculation
      }
    })

    return NextResponse.json({
      categories: enrichedData,
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
    console.error("Product categories list API error:", error)
    return NextResponse.json({ error: "Failed to load product categories" }, { status: 500 })
  }
}
