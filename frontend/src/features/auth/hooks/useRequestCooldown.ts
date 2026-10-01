import {
  useCallback,
  useEffect,
  useState,
} from 'react'

const DEFAULT_DURATION_SECONDS = 60

function readRemainingSeconds(storageKey: string) {
  if (typeof window === 'undefined') {
    return 0
  }

  const storedDeadline = Number(
    window.sessionStorage.getItem(storageKey),
  )

  if (!Number.isFinite(storedDeadline)) {
    return 0
  }

  const remainingSeconds = Math.ceil(
    (storedDeadline - Date.now()) / 1000,
  )

  if (remainingSeconds <= 0) {
    window.sessionStorage.removeItem(storageKey)
    return 0
  }

  return remainingSeconds
}

export function formatCooldown(
  remainingSeconds: number,
) {
  const minutes = Math.floor(
    remainingSeconds / 60,
  )
  const seconds = remainingSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function useRequestCooldown(
  storageKey: string,
  durationSeconds = DEFAULT_DURATION_SECONDS,
) {
  const [remainingSeconds, setRemainingSeconds] =
    useState(() => readRemainingSeconds(storageKey))

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds(
        readRemainingSeconds(storageKey),
      )
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [remainingSeconds, storageKey])

  const startCooldown = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    const deadline =
      Date.now() + durationSeconds * 1000

    window.sessionStorage.setItem(
      storageKey,
      String(deadline),
    )

    setRemainingSeconds(durationSeconds)
  }, [durationSeconds, storageKey])

  return {
    isCoolingDown: remainingSeconds > 0,
    remainingSeconds,
    startCooldown,
  }
}