/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createMeeting, getAllMeetings } from '@/utils/dyte'

/**
 * POST /api/meeting
 * Create a new Dyte meeting
 */
export async function POST(request: NextRequest) {
  try {
    const meetingData = await request.json()

    // Validate required fields
    if (!meetingData.title) {
      return NextResponse.json(
        { error: 'Meeting title is required' },
        { status: 400 }
      )
    }

    // Create meeting via Dyte API
    const meeting = await createMeeting(meetingData)

    return NextResponse.json(meeting, { status: 201 })
  } catch (error: any) {
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create meeting' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/meeting
 * Get all meetings
 */
export async function GET(request: NextRequest) {
  try {
    const meetings = await getAllMeetings()
    return NextResponse.json(meetings, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching meetings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meetings' },
      { status: 500 }
    )
  }
}
