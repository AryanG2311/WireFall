import { getAnalysisCollection } from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    let count = parseInt(searchParams.get('count') || '20')
    count = Math.min(count, 100) // Max 100
    
    const collection = await getAnalysisCollection()
    
    const logs = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(count)
      .toArray()
    
    const formattedLogs = logs.map(log => ({
      ...log,
      _id: log._id.toString(),
      timestamp: log.timestamp?.toISOString()
    }))
    
    return NextResponse.json({
      logs: formattedLogs,
      count: formattedLogs.length
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching recent logs: ${error.message}` },
      { status: 500 }
    )
  }
}
