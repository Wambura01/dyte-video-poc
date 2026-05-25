/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { addParticipant } from '@/utils/dyte'

/**
 * POST /api/meeting/[id]/participants
 * Add a participant to a meeting
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params
    const participantData = await request.json()

    // Validate required fields
    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    if (!participantData.name) {
      return NextResponse.json(
        { error: 'Participant name is required' },
        { status: 400 }
      )
    }

    // Add participant to meeting
    const participant = await addParticipant(meetingId, participantData)

    return NextResponse.json(participant, { status: 201 })
  } catch (error: any) {
    console.error('Error adding participant:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add participant' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/meeting/[id]/participants
 * Get all participants in a meeting
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params

    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Note: This endpoint would need a getParticipants function in utils/dyte.ts
    return NextResponse.json(
      { message: 'Get participants endpoint - implement as needed' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch participants' },
      { status: 500 }
    )
  }
}
