/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dyte API utility functions
 * Handles authentication and API calls to Dyte's meeting API
 */

const DYTE_API_BASE = process.env.DYTE_API_BASE || 'https://api.dyte.io/v2';

// Get the authorization header from environment variables
function getAuthHeader(): string {
  const authKey = process.env.REALTIME_AUTHORIZATION_KEY

  if (!authKey) {
    throw new Error('Missing REALTIME_AUTHORIZATION_KEY environment variable');
  }

  return `Basic ${authKey}`;
}

/**
 * Create a new meeting on Dyte
 * @param meetingData - Meeting configuration data
 * @returns Meeting details from Dyte API
 */
export async function createMeeting(meetingData: any) {
  const authHeader = getAuthHeader();

  const response = await fetch(`${DYTE_API_BASE}/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(meetingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Dyte API Error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get all meetings from Dyte
 * @returns List of meetings from Dyte API
 */
export async function getAllMeetings() {
  const authHeader = getAuthHeader();

  const response = await fetch(`${DYTE_API_BASE}/meetings`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Dyte API Error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get meeting details by ID from Dyte
 * @param meetingId - The Dyte meeting ID
 * @returns Meeting details from Dyte API
 */
export async function getMeetingById(meetingId: string) {
  const authHeader = getAuthHeader();

  const response = await fetch(`${DYTE_API_BASE}/meetings/${meetingId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Dyte API Error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Add a participant to a meeting
 * @param meetingId - The Dyte meeting ID
 * @param participantData - Participant configuration (name, etc.)
 * @returns Participant details with auth token from Dyte API
 */
export async function addParticipant(meetingId: string, participantData: any) {
  const authHeader = getAuthHeader();

  const response = await fetch(`${DYTE_API_BASE}/meetings/${meetingId}/participants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(participantData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Dyte API Error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json();
}
