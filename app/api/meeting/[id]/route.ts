/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getMeetingById } from '@/utils/dyte'

/**
 * GET /api/meeting/[id]
 * Get a specific meeting by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params

    // Validate meeting ID
    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Get meeting from Dyte API
    const meeting = await getMeetingById(meetingId)

    return NextResponse.json(meeting, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching meeting:', error)

    // Handle specific error cases
    if (error.message.includes('404')) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch meeting' },
      { status: 500 }
    )
  }
}
