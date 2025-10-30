import { NextResponse } from 'next/server'
import { loadData } from '@/lib/data'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { buildings } = loadData()
  const building = buildings.find(b => b.id === id)

  if (!building) {
    return new Response('Building not found', { status: 404 })
  }

  return NextResponse.json(building)
}