'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from '@/app/styles/home.module.css'

interface Meeting {
  id: string
  title: string
  created_at: string
  status?: string
}

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/meeting')
        if (!response.ok) {
          throw new Error('Failed to fetch meetings')
        }
        const data = await response.json()
        setMeetings(data.data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading meetings')
        setMeetings([])
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Video Conference Meetings</h1>
          <Link href="/meeting">
            <button className={styles.primaryButton}>Start New Meeting</button>
          </Link>
        </div>

        <div className={styles.content}>
          {loading && <p className={styles.loading}>Loading meetings...</p>}

          {error && <p className={styles.error}>Error: {error}</p>}

          {!loading && meetings.length === 0 && !error && (
            <p className={styles.empty}>
              No meetings yet. Create one to get started!
            </p>
          )}

          {!loading && meetings.length > 0 && (
            <div className={styles.meetingsList}>
              <h2>Recent Meetings</h2>
              <div className={styles.grid}>
                {meetings.map(meeting => (
                  <Link
                    style={{ textDecoration: 'none' }}
                    key={meeting.id}
                    href={`/meeting/${meeting.id}`}
                  >
                    <div className={styles.meetingCard}>
                      <div className={styles.meetingTitle}>{meeting.title}</div>
                      <div className={styles.meetingDate}>
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </div>
                      <button className={styles.joinButton}>
                        Join Meeting
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
