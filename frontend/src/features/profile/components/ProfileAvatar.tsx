import {
  useEffect,
  useRef,
} from 'react'

import type { UserProfile } from '@/features/profile/api/types'
import { useProfileAvatar } from '@/features/profile/hooks/useProfileAvatar'

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

  return `${first[0] ?? 'S'}${last[0] ?? ''
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

  const imageRef = useRef<HTMLImageElement>(null,)
  const avatarBlob = avatarQuery.data

  useEffect(() => {
    if (!avatarBlob) {
      return
    }

    const imageUrl = URL.createObjectURL(avatarBlob)

    const image = imageRef.current

    if (image) {
      image.src = imageUrl
    }

    return () => {
      URL.revokeObjectURL(
        imageUrl,
      )
    }
  }, [avatarBlob])

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
      {avatarBlob ? (
        <img
          ref={imageRef}
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
