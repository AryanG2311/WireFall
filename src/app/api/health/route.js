import { getAnalysisCollection } from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const collection = await getAnalysisCollection()
    await collection.findOne({})
    
    return NextResponse.json({
      status: 'healthy',
      mongodb_connected: true
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        mongodb_connected: false,
        error: error.message
      },
      { status: 503 }
    )
  }
}
        