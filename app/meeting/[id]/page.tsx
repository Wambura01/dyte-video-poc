/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'next/navigation'
import { RtkMeeting } from '@cloudflare/realtimekit-react-ui'
import { useRealtimeKitClient } from '@cloudflare/realtimekit-react'
import RealtimeKitVideoBackgroundTransformer from '@cloudflare/realtimekit-virtual-background'
import styles from '@/app/styles/meeting.module.css'

declare global {
  interface Window {
    meeting: any
  }
}

export default function MeetingPage() {
  const params = useParams()
  const [meeting, initMeeting] = useRealtimeKitClient()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [backgroundMode, setBackgroundMode] = useState<
    'blur' | 'image' | 'none'
  >('blur')
  const [backgroundImageName, setBackgroundImageName] = useState('')
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null
  )
  const [showNameForm, setShowNameForm] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const meetingRef = useRef<any>(null)
  const videoBackgroundTransformerRef = useRef<any>(null)
  const backgroundMiddlewareRef = useRef<any>(null)
  const meetingId = params.id as string

  const readImageAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
          return
        }

        reject(new Error('Failed to read image file'))
      }

      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(file)
    })

  const removeExistingBackgroundMiddleware = async () => {
    const meetingInstance = meetingRef.current

    if (!meetingInstance || !backgroundMiddlewareRef.current) {
      return
    }

    meetingInstance.self.removeVideoMiddleware(backgroundMiddlewareRef.current)
    backgroundMiddlewareRef.current = null
  }

  const applyBackgroundEffect = async (
    nextMode: 'blur' | 'image' | 'none',
    imageUrl: string | null
  ) => {
    const meetingInstance = meetingRef.current

    if (!meetingInstance) {
      return
    }

    await removeExistingBackgroundMiddleware()

    if (nextMode === 'none') {
      return
    }

    if (!RealtimeKitVideoBackgroundTransformer.isSupported()) {
      return
    }

    const transformer =
      videoBackgroundTransformerRef.current ??
      (await RealtimeKitVideoBackgroundTransformer.init({
        meeting: meetingInstance,
        segmentationConfig: {
          pipeline: 'canvas2dCpu'
        }
      }))

    videoBackgroundTransformerRef.current = transformer

    if (nextMode === 'image') {
      if (!imageUrl) {
        throw new Error('Upload an image before selecting the image background')
      }

      const nextMiddleware =
        await transformer.createStaticBackgroundVideoMiddleware(imageUrl)
      meetingInstance.self.addVideoMiddleware(nextMiddleware)
      backgroundMiddlewareRef.current = nextMiddleware
      return
    }

    const nextMiddleware =
      await transformer.createBackgroundBlurVideoMiddleware(10)

    meetingInstance.self.addVideoMiddleware(nextMiddleware)
    backgroundMiddlewareRef.current = nextMiddleware
  }

  const handleBackgroundImageChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const dataUrl = await readImageAsDataUrl(file)
      setBackgroundImageName(file.name)
      setBackgroundImageUrl(dataUrl)

      if (meetingRef.current) {
        await applyBackgroundEffect(backgroundMode, dataUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image')
    }
  }

  const handleBackgroundModeChange = async (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const nextMode = e.target.value as 'blur' | 'image' | 'none'
    setBackgroundMode(nextMode)
    setError(null)

    if (!meetingRef.current) {
      return
    }

    try {
      await applyBackgroundEffect(nextMode, backgroundImageUrl)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update background'
      )
    }
  }

  const handleJoinMeeting = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!userName.trim()) {
        throw new Error('Please enter your name')
      }

      if (!userEmail.trim()) {
        throw new Error('Please enter your email')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userEmail)) {
        throw new Error('Please enter a valid email')
      }

      // Add participant to meeting and get auth token
      const participantResponse = await fetch(
        `/api/meeting/${meetingId}/participants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: userName,
            custom_participant_id: userEmail,
            preset_name: 'host'
          })
        }
      )

      if (!participantResponse.ok) {
        const errorData = await participantResponse.json()
        throw new Error(errorData.error || 'Failed to join meeting')
      }

      const participantData = await participantResponse.json()
      const authToken = participantData.data?.token

      if (!authToken) {
        throw new Error('No auth token received')
      }

      // Initialize meeting with auth token
      await initializeMeeting(authToken, backgroundMode, backgroundImageUrl)
      setShowNameForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join meeting')
      setLoading(false)
    }
  }

  const initializeMeeting = async (
    authToken: string,
    nextBackgroundMode: 'blur' | 'image' | 'none',
    customBackgroundUrl: string | null
  ) => {
    try {
      const meetingInstance = await (initMeeting({
        authToken
      }) as any)

      meetingRef.current = meetingInstance
      window.meeting = meetingInstance

      await applyBackgroundEffect(nextBackgroundMode, customBackgroundUrl)
    } catch (err) {
      console.error('Error initializing meeting:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to initialize meeting'
      )
      setLoading(false)
    }
  }

  if (showNameForm) {
    return (
      <div className={styles.nameFormContainer}>
        <div className={styles.nameFormWrapper}>
          <h2>Join Meeting</h2>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleJoinMeeting} className={styles.nameForm}>
            <div className={styles.formGroup}>
              <label htmlFor="userName">Your Name</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Your Email</label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="backgroundMode">Background Preset</label>
              <select
                id="backgroundMode"
                value={backgroundMode}
                onChange={handleBackgroundModeChange}
                disabled={loading}
              >
                <option value="blur">Blur</option>
                <option value="image">Uploaded image</option>
                <option value="none">No background effect</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="backgroundImage">Background Image</label>
              <input
                type="file"
                id="backgroundImage"
                accept="image/*"
                onChange={handleBackgroundImageChange}
                disabled={loading}
              />
              <p className={styles.helperText}>
                {backgroundImageName
                  ? `Selected: ${backgroundImageName}`
                  : 'Optional. Upload an image if you want to use the image preset.'}
              </p>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !userName.trim() || !userEmail.trim()}
            >
              {loading ? 'Joining...' : 'Join Meeting'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.videoContainer}>
      <div className={styles.backgroundControls}>
        <div className={styles.backgroundControlsLabel}>Background</div>
        <select value={backgroundMode} onChange={handleBackgroundModeChange}>
          <option value="blur">Blur</option>
          <option value="image">Uploaded image</option>
          <option value="none">No background effect</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={handleBackgroundImageChange}
        />
        <p className={styles.helperText}>
          {backgroundMode === 'image'
            ? backgroundImageName
              ? `Using ${backgroundImageName}`
              : 'Upload an image to use the image preset.'
            : backgroundMode === 'none'
              ? 'Background effects are disabled.'
              : 'Blur is active.'}
        </p>
      </div>

      {meeting ? (
        <RtkMeeting meeting={meeting} />
      ) : (
        <div className={styles.loadingScreen}>
          <p>Initializing meeting...</p>
        </div>
      )}
    </div>
  )
}
