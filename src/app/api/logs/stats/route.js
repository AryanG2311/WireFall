import { getAnalysisCollection } from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const collection = await getAnalysisCollection()
    
    const totalLogs = await collection.countDocuments({})
    const maliciousLogs = await collection.countDocuments({ 'analysis.is_malicious': true })
    const benignLogs = totalLogs - maliciousLogs
    
    const oldest = await collection.findOne({}, { sort: { timestamp: 1 } })
    const newest = await collection.findOne({}, { sort: { timestamp: -1 } })
    
    return NextResponse.json({
      total_logs: totalLogs,
      malicious_logs: maliciousLogs,
      benign_logs: benignLogs,
      oldest_log: oldest?.timestamp?.toISOString() || null,
      newest_log: newest?.timestamp?.toISOString() || null,
      detection_rate: totalLogs > 0 ? Math.round((maliciousLogs / totalLogs * 100) * 100) / 100 : 0
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching stats: ${error.message}` },
      { status: 500 }
    )
  }
}
