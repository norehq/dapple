import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ReactElement } from 'react'
import type { DappleSettings, DappleSource } from '@unix/dapple'
import type { DappleFieldOptions } from '@unix/dapple/field'

import {
  DEFAULT_IMAGE_INDEX,
  IMAGE_SOURCES,
  IMAGE_SOURCE_SWAP_DELAY_MS,
  UPLOAD_SOURCE_SWAP_DELAY_MS,
  type SelectedImageKey,
  type UploadedImage,
} from '@/config'
import { HeaderBlock } from './header-block'
import { ImageSourceBar } from './image-source-bar'
import { PreviewStage } from './preview-stage'

type PreviewPaneProps = {
  baseSettings: Partial<DappleSettings>
  onNotify: (message: string) => void
  onResetSettings: () => void
  previewSettings: Partial<DappleSettings>
}

export const PreviewPane = ({
  baseSettings,
  onNotify,
  onResetSettings,
  previewSettings,
}: PreviewPaneProps): ReactElement => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImageKey, setSelectedImageKey] =
    useState<SelectedImageKey>(DEFAULT_IMAGE_INDEX)
  const [source, setSource] = useState<DappleSource | undefined>({
    imageUrl: IMAGE_SOURCES[DEFAULT_IMAGE_INDEX].url,
  })
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedObjectUrlRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (uploadedObjectUrlRef.current) {
        URL.revokeObjectURL(uploadedObjectUrlRef.current)
      }
    },
    [],
  )

  const field = useMemo<DappleFieldOptions>(
    () => ({
      backgroundColor: baseSettings.backgroundColor ?? '#050505',
      cells: 76,
      color: '#56564f',
      jitter: 0.18,
      rows: 48,
      seed: selectedImageKey === 'uploaded' ? uploadedImage?.url : selectedImageKey,
      size: baseSettings.tileSize,
    }),
    [
      baseSettings.backgroundColor,
      baseSettings.tileSize,
      selectedImageKey,
      uploadedImage?.url,
    ],
  )

  const loadImageSource = (nextImageIndex: number) => {
    setErrorMessage(null)
    setIsLoading(true)
    setSelectedImageKey(nextImageIndex)
    setSource(undefined)

    window.setTimeout(() => {
      const nextVersion = `${Date.now()}-${nextImageIndex}`
      const nextSource = IMAGE_SOURCES[nextImageIndex] ?? IMAGE_SOURCES[0]

      setSource({
        imageUrl: `${nextSource.url}${nextSource.url.includes('?') ? '&' : '?'}v=${nextVersion}`,
      })
    }, IMAGE_SOURCE_SWAP_DELAY_MS)
  }

  const loadUploadedImage = (nextUploadedImage: UploadedImage) => {
    setErrorMessage(null)
    setIsLoading(true)
    setSelectedImageKey('uploaded')
    setSource(undefined)

    window.setTimeout(() => {
      setSource({ imageUrl: nextUploadedImage.url })
    }, UPLOAD_SOURCE_SWAP_DELAY_MS)
  }

  const reloadSelectedImage = () => {
    if (selectedImageKey === 'uploaded') {
      if (!uploadedImage) {
        return
      }

      loadUploadedImage(uploadedImage)
      return
    }

    loadImageSource(selectedImageKey)
  }

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]

    event.currentTarget.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file.')
      return
    }

    const imageUrl = URL.createObjectURL(file)

    if (uploadedObjectUrlRef.current) {
      URL.revokeObjectURL(uploadedObjectUrlRef.current)
    }

    const nextUploadedImage: UploadedImage = {
      label: file.name || 'Uploaded image',
      url: imageUrl,
    }

    uploadedObjectUrlRef.current = imageUrl
    setUploadedImage(nextUploadedImage)
    loadUploadedImage(nextUploadedImage)
  }

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
      <HeaderBlock
        isLoading={isLoading}
        onReload={reloadSelectedImage}
        onReset={onResetSettings}
      />
      <ImageSourceBar
        fileInputRef={fileInputRef}
        onImageSelect={loadImageSource}
        onUploadChange={uploadImage}
        onUploadClick={() => fileInputRef.current?.click()}
        selectedImageKey={selectedImageKey}
        uploadedImage={uploadedImage}
      />
      <PreviewStage
        errorMessage={errorMessage}
        isLoading={isLoading}
        onError={error => {
          setErrorMessage(error.message)
          setIsLoading(false)
        }}
        onNotify={onNotify}
        onReady={() => setIsLoading(false)}
        field={field}
        settings={previewSettings}
        source={source}
      />
    </section>
  )
}
