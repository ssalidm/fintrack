import {
  Camera,
  LoaderCircle,
  Trash2,
} from 'lucide-react'
import {
  useRef,
  useState,
} from 'react'

import { ApiClientError } from '../../../api/ApiClientError'
import type { UserProfile } from '../api/types'
import { useProfileAvatar } from '../hooks/useProfileAvatar'
import {
  useDeleteProfileAvatar,
  useUploadProfileAvatar,
} from '../hooks/useProfileAvatarMutations'
import { prepareProfileAvatar } from '../utils/prepareProfileAvatar'
import ProfileAvatar from './ProfileAvatar'

interface ProfileAvatarEditorProps {
  readonly profile: UserProfile
}

export default function ProfileAvatarEditor({
  profile,
}: ProfileAvatarEditorProps) {
  const inputRef =
    useRef<HTMLInputElement>(null)

  const avatarQuery =
    useProfileAvatar()

  const uploadMutation =
    useUploadProfileAvatar()

  const deleteMutation =
    useDeleteProfileAvatar()

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null,
  )

  const isBusy =
    uploadMutation.isPending ||
    deleteMutation.isPending

  async function handleFile(
    file: File,
  ) {
    setMessage(null)

    try {
      const preparedFile =
        await prepareProfileAvatar(
          file,
        )

      await uploadMutation.mutateAsync(
        preparedFile,
      )
    } catch (error) {
      setMessage(
        error instanceof
        ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to update your profile photo.',
      )
    }
  }

  async function handleDelete() {
    setMessage(null)

    try {
      await deleteMutation.mutateAsync()
    } catch (error) {
      setMessage(
        error instanceof
        ApiClientError
          ? error.message
          : 'Unable to remove your profile photo.',
      )
    }
  }

  return (
    <div className="w-20 shrink-0">
      <div className="relative size-20">
        <ProfileAvatar
          profile={profile}
          className="border-2 size-20 rounded-full text-base"
        />

        <button
          type="button"
          disabled={isBusy}
          onClick={() =>
            inputRef.current?.click()
          }
          className="
            absolute
            -bottom-1 -right-1
            grid size-7
            cursor-pointer
            place-items-center
            rounded-full
            border-2 border-surface
            bg-primary
            text-inverse
            shadow-sm
            transition
            hover:bg-primary-hover
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
          aria-label="Change profile photo"
          title="Change profile photo"
        >
          {uploadMutation.isPending ? (
            <LoaderCircle
              size={14}
              className="animate-spin"
              aria-hidden
            />
          ) : (
            <Camera
              size={14}
              aria-hidden
            />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file =
            event.target.files?.[0]

          event.target.value = ''

          if (file) {
            void handleFile(file)
          }
        }}
      />

      <div className="mt-3 flex w-20 flex-col items-left gap-1.5">
        <button
          type="button"
          disabled={isBusy}
          onClick={() =>
            inputRef.current?.click()
          }
          className="
            cursor-pointer
            whitespace-nowrap
            text-xs font-semibold
            text-accent
            transition
            hover:text-primary
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          Change photo
        </button>

        {avatarQuery.data && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              void handleDelete()
            }
            className="
              inline-flex
              cursor-pointer
              items-center
              gap-1.5
              text-xs font-semibold
              text-danger
              transition
              hover:opacity-80
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {deleteMutation.isPending ? (
              <LoaderCircle
                size={12}
                className="animate-spin"
                aria-hidden
              />
            ) : (
              <Trash2
                size={12}
                aria-hidden
              />
            )}

            Remove
          </button>
        )}
      </div>

      {message && (
        <p
          className="mt-2 w-20 text-center text-[10px] leading-4 text-danger"
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  )
}
