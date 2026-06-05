import { ChevronDownIcon, Download04Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState } from 'react'
import { DappleField } from '@unix/dapple/react-field'
import { DappleCanvas, type DappleCanvasHandle } from '@unix/dapple/react'
import {
  DEFAULT_SETTINGS,
  type DappleErrorHandler,
  type DappleSettings,
  type DappleSource,
} from '@unix/dapple'
import type { DappleFieldOptions } from '@unix/dapple/field'
import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const FIELD_FADE_MS = 260

type DownloadMode = 'background' | 'transparent'

type PreviewStageProps = {
  errorMessage: string | null
  field: DappleFieldOptions
  isLoading: boolean
  onError: DappleErrorHandler
  onNotify: (message: string) => void
  onReady: () => void
  settings: Partial<DappleSettings>
  source?: DappleSource
}

const canvasBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Unable to export image.'))
          return
        }

        resolve(blob)
      },
      type,
      quality,
    )
  })

const loadBlobImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Unable to prepare exported image.'))
    }
    image.src = url
  })

const addBackgroundToPng = async (
  blob: Blob,
  backgroundColor: string,
): Promise<Blob> => {
  const image = await loadBlobImage(blob)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to prepare exported image.')
  }

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  context.fillStyle = backgroundColor
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0)

  return canvasBlob(canvas, 'image/png')
}

export const PreviewStage = ({
  errorMessage,
  field,
  isLoading,
  onError,
  onNotify,
  onReady,
  settings,
  source,
}: PreviewStageProps): ReactElement => {
  const [isFieldMounted, setIsFieldMounted] = useState(true)
  const [hasReadySource, setHasReadySource] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  const canvasRef = useRef<DappleCanvasHandle>(null)
  const canDownload = Boolean(source && !errorMessage && !isLoading)
  const showField = !source || isLoading || !hasReadySource

  useEffect(() => {
    setHasReadySource(false)
  }, [source])

  useEffect(() => {
    if (showField) {
      setIsFieldMounted(true)
      return
    }

    const timeout = window.setTimeout(() => {
      setIsFieldMounted(false)
    }, FIELD_FADE_MS)

    return () => window.clearTimeout(timeout)
  }, [showField])

  const downloadImage = async (mode: DownloadMode) => {
    const renderer = canvasRef.current?.renderer

    if (!renderer || isDownloading) {
      return
    }

    setIsDownloading(true)

    try {
      const snapshotBlob = await renderer.snapshot({ type: 'image/png' })
      const blob =
        mode === 'background'
          ? await addBackgroundToPng(
              snapshotBlob,
              settings.backgroundColor ?? DEFAULT_SETTINGS.backgroundColor,
            )
          : snapshotBlob
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.download = `dapple-${new Date().toISOString().replace(/[:.]/g, '-')}${
        mode === 'transparent' ? '-transparent' : ''
      }.png`
      link.href = url
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
      onNotify('Image downloaded.')
    } catch {
      onNotify('Image could not be downloaded.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="relative h-[min(70svh,620px)] min-h-80 min-[981px]:h-auto min-[981px]:min-h-0 min-[981px]:flex-1">
      <DappleCanvas
        className={`transition-opacity duration-300 ease-out ${
          hasReadySource ? 'opacity-100' : 'opacity-0'
        }`}
        onError={onError}
        onReady={() => {
          setHasReadySource(true)
          onReady()
        }}
        placeholder={false}
        ref={canvasRef}
        settings={settings}
        source={source}
      />
      {isFieldMounted ? (
        <DappleField
          {...field}
          className={`transition-opacity duration-300 ease-out ${
            showField ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}
      <div
        className={cn(
          'group/export absolute right-3 top-3 z-10 inline-flex overflow-hidden rounded-md bg-foreground/65 text-background backdrop-blur-md transition-colors hover:bg-foreground hover:text-background',
          isExportMenuOpen && 'bg-foreground text-background',
        )}>
        <Button
          className="rounded-none border-0 bg-transparent text-inherit shadow-none hover:bg-foreground/5 hover:text-inherit active:translate-y-0"
          disabled={!canDownload || isDownloading}
          onClick={() => downloadImage('background')}
          size="sm"
          type="button"
          variant="secondary">
          <HugeiconsIcon icon={Download04Icon} className="text-inherit" />
          Export
        </Button>
        <DropdownMenu open={isExportMenuOpen} onOpenChange={setIsExportMenuOpen}>
          <DropdownMenuTrigger
            aria-label="Export options"
            disabled={!canDownload || isDownloading}
            className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-none border-0 border-l border-l-current/25 bg-transparent text-inherit shadow-none transition-all outline-none select-none hover:bg-foreground/5 hover:text-inherit focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:text-inherit">
            <HugeiconsIcon
              icon={ChevronDownIcon}
              color="inherit"
              className="text-inherit"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-max min-w-32 max-w-[calc(100vw-2rem)]">
            <DropdownMenuItem
              className="whitespace-nowrap"
              onClick={() => downloadImage('transparent')}>
              Transparent PNG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {errorMessage ? (
        <div className="absolute left-3 top-3 z-10 max-w-[min(560px,calc(100%-24px))] rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMessage}
        </div>
      ) : null}
    </div>
  )
}
