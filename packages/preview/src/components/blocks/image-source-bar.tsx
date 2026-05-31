import { CloudUploadIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ChangeEvent, ReactElement, RefObject } from 'react'

import { Button } from '@/components/ui/button'
import { IMAGE_SOURCES, type SelectedImageKey, type UploadedImage } from '@/config'

type ImageSourceBarProps = {
  fileInputRef: RefObject<HTMLInputElement | null>
  onImageSelect: (imageIndex: number) => void
  onUploadChange: (event: ChangeEvent<HTMLInputElement>) => void
  onUploadClick: () => void
  selectedImageKey: SelectedImageKey
  uploadedImage: UploadedImage | null
}

export const ImageSourceBar = ({
  fileInputRef,
  onImageSelect,
  onUploadChange,
  onUploadClick,
  selectedImageKey,
  uploadedImage,
}: ImageSourceBarProps): ReactElement => (
  <div className="flex flex-wrap gap-2 border-b px-2 py-2 sm:px-4">
    <input
      accept="image/*"
      className="hidden"
      onChange={onUploadChange}
      ref={fileInputRef}
      type="file"
    />
    {IMAGE_SOURCES.map((imageSource, index) => (
      <Button
        aria-pressed={selectedImageKey === index}
        key={imageSource.url}
        onClick={() => onImageSelect(index)}
        size="sm"
        type="button"
        variant={selectedImageKey === index ? 'default' : 'outline'}>
        {imageSource.label}
      </Button>
    ))}
    <Button
      aria-pressed={selectedImageKey === 'uploaded'}
      className="max-w-48 min-w-0 overflow-hidden"
      onClick={onUploadClick}
      size="sm"
      title={uploadedImage?.label ?? 'Upload image'}
      type="button"
      variant={selectedImageKey === 'uploaded' ? 'default' : 'outline'}>
      <HugeiconsIcon icon={CloudUploadIcon} />
      <span className="min-w-0 flex-1 truncate text-left">
        {uploadedImage?.label ?? 'Upload image'}
      </span>
    </Button>
  </div>
)
