import { NextResponse } from 'next/server'
import { loadData } from '@/lib/data'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { zones } = loadData()
  const zone = zones.find(z => z.id === id)

  if (!zone) {
    return new Response('Zone not found', { status: 404 })
  }

  return NextResponse.json(zone)
}