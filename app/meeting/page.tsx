'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/app/styles/meeting.module.css'

export default function CreateMeeting() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    preferred_region: 'ap-south-1'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create meeting
      const meetingResponse = await fetch('/api/meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!meetingResponse.ok) {
        const errorData = await meetingResponse.json()
        throw new Error(errorData.error || 'Failed to create meeting')
      }

      const meeting = await meetingResponse.json()
      const meetingId = meeting.data?.id

      if (!meetingId) {
        throw new Error('No meeting ID returned')
      }

      // Redirect to join page
      router.push(`/meeting/${meetingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Create a New Meeting</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Meeting Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Team Standup"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="preferred_region">Region</label>
            <select
              id="preferred_region"
              name="preferred_region"
              value={formData.preferred_region}
              onChange={handleChange}
            >
              <option value="ap-south-1">Asia Pacific (Mumbai)</option>
              <option value="us-east-1">US East</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Meeting...' : 'Create Meeting'}
          </button>
        </form>
      </div>
    </div>
  )
}
