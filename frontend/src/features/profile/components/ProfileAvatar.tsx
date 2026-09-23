import {
  useEffect,
  useState,
} from 'react'

import type { UserProfile } from '../api/types'
import { useProfileAvatar } from '../hooks/useProfileAvatar'

interface ProfileAvatarProps {
  readonly profile:
    | UserProfile
    | undefined
  readonly className: string
  readonly imageClassName?: string
}

function initialsFor(
  profile:
    | UserProfile
    | undefined,
) {
  const first =
    profile?.preferredName?.trim() ||
    profile?.firstName?.trim() ||
    'S'

  const last =
    profile?.lastName?.trim() ||
    ''

  return `${first[0] ?? 'S'}${
    last[0] ?? ''
  }`.toUpperCase()
}

function displayNameFor(
  profile:
    | UserProfile
    | undefined,
) {
  if (!profile) {
    return 'Profile'
  }

  return `${profile.firstName} ${profile.lastName}`.trim()
}

export default function ProfileAvatar({
  profile,
  className,
  imageClassName = '',
}: ProfileAvatarProps) {
  const avatarQuery =
    useProfileAvatar()

  const [
    imageUrl,
    setImageUrl,
  ] = useState<string | null>(
    null,
  )

  useEffect(() => {
    const blob =
      avatarQuery.data

    if (!blob) {
      setImageUrl(null)
      return
    }

    const nextUrl =
      URL.createObjectURL(
        blob,
      )

    setImageUrl(nextUrl)

    return () => {
      URL.revokeObjectURL(
        nextUrl,
      )
    }
  }, [avatarQuery.data])

  return (
    <span
      className={`
        relative
        grid
        shrink-0
        place-items-center
        overflow-hidden
        bg-primary
        font-bold
        text-inverse
        ${className}
      `}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${displayNameFor(profile)} profile`}
          className={`
            h-full w-full
            object-cover
            ${imageClassName}
          `}
        />
      ) : (
        initialsFor(profile)
      )}
    </span>
  )
}
