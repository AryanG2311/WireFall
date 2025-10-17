import { getAnalysisCollection } from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    let limit = parseInt(searchParams.get('limit') || '50')
    let skip = parseInt(searchParams.get('skip') || '0')
    
    // Enforce reasonable limits
    limit = Math.min(Math.max(limit, 1), 1000)
    skip = Math.max(skip, 0)
    
    const collection = await getAnalysisCollection()
    
    // Fetch logs sorted by timestamp (newest first)
    const logs = await collection
      .find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Get total count
    const totalCount = await collection.countDocuments({})
    
    // Convert ObjectId to string and timestamp to ISO format
    const formattedLogs = logs.map(log => ({
      ...log,
      _id: log._id.toString(),
      timestamp: log.timestamp?.toISOString()
    }))
    
    console.log(`[${new Date().toISOString()}] Fetched ${formattedLogs.length} logs`)
    
    return NextResponse.json({
      logs: formattedLogs,
      count: formattedLogs.length,
      total: totalCount,
      skip,
      limit,
      has_more: (skip + formattedLogs.length) < totalCount
    })
    
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: `Error fetching logs: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const collection = await getAnalysisCollection()
    const result = await collection.deleteMany({})
    
    console.log(`[${new Date().toISOString()}] Cleared ${result.deletedCount} logs`)
    
    return NextResponse.json({
      status: 'success',
      message: `Deleted ${result.deletedCount} logs`,
      deleted_count: result.deletedCount
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: `Error clearing logs: ${error.message}` },
      { status: 500 }
    )
  }
}
