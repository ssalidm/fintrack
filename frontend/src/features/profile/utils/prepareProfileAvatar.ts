const MAX_SOURCE_SIZE_BYTES =
  10 * 1024 * 1024

const MAX_UPLOAD_SIZE_BYTES =
  900 * 1024

const MAX_DIMENSION = 512

const supportedSourceTypes =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ])

function loadImage(
  file: File,
): Promise<HTMLImageElement> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const image =
        new Image()

      const objectUrl =
        URL.createObjectURL(
          file,
        )

      image.onload = () => {
        URL.revokeObjectURL(
          objectUrl,
        )

        resolve(image)
      }

      image.onerror = () => {
        URL.revokeObjectURL(
          objectUrl,
        )

        reject(
          new Error(
            'We could not read that image.',
          ),
        )
      }

      image.src =
        objectUrl
    },
  )
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise(
    (resolve) => {
      canvas.toBlob(
        resolve,
        type,
        quality,
      )
    },
  )
}

export async function prepareProfileAvatar(
  file: File,
): Promise<File> {
  if (
    !supportedSourceTypes.has(
      file.type,
    )
  ) {
    throw new Error(
      'Choose a JPEG, PNG or WebP image.',
    )
  }

  if (
    file.size >
    MAX_SOURCE_SIZE_BYTES
  ) {
    throw new Error(
      'Choose an image smaller than 10 MB.',
    )
  }

  const image =
    await loadImage(file)

  const scale = Math.min(
    1,
    MAX_DIMENSION /
      Math.max(
        image.naturalWidth,
        image.naturalHeight,
      ),
  )

  const width = Math.max(
    1,
    Math.round(
      image.naturalWidth *
        scale,
    ),
  )

  const height = Math.max(
    1,
    Math.round(
      image.naturalHeight *
        scale,
    ),
  )

  const canvas =
    document.createElement(
      'canvas',
    )

  canvas.width = width
  canvas.height = height

  const context =
    canvas.getContext('2d')

  if (!context) {
    throw new Error(
      'Image processing is not available in this browser.',
    )
  }

  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  )

  let blob =
    await canvasToBlob(
      canvas,
      'image/webp',
      0.86,
    )

  let type =
    'image/webp'

  if (!blob) {
    blob =
      await canvasToBlob(
        canvas,
        'image/jpeg',
        0.86,
      )

    type =
      'image/jpeg'
  }

  if (!blob) {
    throw new Error(
      'We could not prepare that image for upload.',
    )
  }

  if (
    blob.size >
    MAX_UPLOAD_SIZE_BYTES
  ) {
    throw new Error(
      'That image is still too large after processing. Try a smaller photo.',
    )
  }

  const extension =
    type === 'image/webp'
      ? 'webp'
      : 'jpg'

  return new File(
    [blob],
    `avatar.${extension}`,
    {
      type,
    },
  )
}
