import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { id } = await request.json()

  // Simulate a sync process
  await new Promise(resolve => setTimeout(resolve, 2000))

  // In a real application, you would fetch data from the third-party API here

  return NextResponse.json({ message: 'Sync successful' })
}
