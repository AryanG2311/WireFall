import { getAnalysisCollection } from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

export async function GET(request, { params }) {
  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid log ID' },
        { status: 400 }
      )
    }
    
    const collection = await getAnalysisCollection()
    const log = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      ...log,
      _id: log._id.toString(),
      timestamp: log.timestamp?.toISOString()
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching log: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid log ID' },
        { status: 400 }
      )
    }
    
    const collection = await getAnalysisCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      )
    }
    
    console.log(`[${new Date().toISOString()}] Deleted log: ${id}`)
    
    return NextResponse.json({
      status: 'success',
      message: 'Log deleted',
      log_id: id
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: `Error deleting log: ${error.message}` },
      { status: 500 }
    )
  }
}
