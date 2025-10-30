import { NextResponse } from 'next/server'
import { loadData } from '@/lib/data'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { floors } = loadData()
  const floor = floors.find(f => f.id === id)

  if (!floor) {
    return new Response('Floor not found', { status: 404 })
  }

  return NextResponse.json(floor)
}