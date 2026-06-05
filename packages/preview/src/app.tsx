import { useCallback, useEffect, useRef, useState } from 'react'
import { DappleField } from '@unix/dapple/react-field'
import type { ReactElement } from 'react'
import type { DapplePresentationMode, DappleSettings } from '@unix/dapple'

import { PreviewPane, SettingsPanel } from '@/components/blocks'
import { DEFAULT_PREVIEW_SETTINGS } from '@/config'

type ToastState = {
  id: number
  message: string
}

const MOBILE_DEVICE_PATTERN =
  /Android|BlackBerry|iPad|iPhone|iPod|IEMobile|Mobile|Opera Mini/i

const detectMobileDevice = (): boolean => {
  if (MOBILE_DEVICE_PATTERN.test(window.navigator.userAgent)) {
    return true
  }

  return (
    window.navigator.maxTouchPoints > 1 &&
    window.matchMedia('(max-width: 980px)').matches
  )
}

const previewDefaultSettings = (
  presentationMode: DapplePresentationMode,
): Partial<DappleSettings> => ({
  ...DEFAULT_PREVIEW_SETTINGS,
  presentationMode,
})

const useDefaultPresentationMode = (): DapplePresentationMode => {
  const [presentationMode] = useState<DapplePresentationMode>(() =>
    detectMobileDevice() ? 'composited' : 'direct',
  )

  useEffect(() => {
    const root = document.documentElement
    const isMobile = presentationMode === 'composited'

    root.classList.toggle('is-mobile-device', isMobile)
    root.classList.toggle('is-desktop-device', !isMobile)

    return () => {
      root.classList.remove('is-mobile-device', 'is-desktop-device')
    }
  }, [presentationMode])

  return presentationMode
}

const LoadingRoute = (): ReactElement => (
  <main className="relative min-h-dvh overflow-hidden bg-black">
    <DappleField
      backgroundColor="#050505"
      cells={76}
      color="#56564f"
      jitter={0.18}
      rows={48}
      seed="loading"
      size={10}
    />
  </main>
)

const PreviewRoute = (): ReactElement => {
  const defaultPresentationMode = useDefaultPresentationMode()
  const [baseSettings, setBaseSettings] = useState<Partial<DappleSettings>>(
    () => previewDefaultSettings(defaultPresentationMode),
  )
  const [previewSettings, setPreviewSettings] = useState<Partial<DappleSettings>>(
    () => previewDefaultSettings(defaultPresentationMode),
  )
  const [resetVersion, setResetVersion] = useState(0)
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  const resetSettings = useCallback(() => {
    setResetVersion(version => version + 1)
  }, [])

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current)
    }

    const id = Date.now()

    setToast({ id, message })
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(current => (current?.id === id ? null : current))
      toastTimeoutRef.current = null
    }, 2600)
  }, [])

  useEffect(
    () => () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    },
    [],
  )

  return (
    <main className="grid min-h-dvh gap-3 bg-background p-2 text-foreground sm:p-3 min-[981px]:h-dvh min-[981px]:min-h-0 min-[981px]:grid-cols-[minmax(0,1fr)_340px] min-[981px]:overflow-hidden">
      <PreviewPane
        baseSettings={baseSettings}
        onNotify={showToast}
        onResetSettings={resetSettings}
        previewSettings={previewSettings}
      />
      <SettingsPanel
        defaultPresentationMode={defaultPresentationMode}
        onBaseSettingsChange={setBaseSettings}
        onNotify={showToast}
        onPreviewSettingsChange={setPreviewSettings}
        resetVersion={resetVersion}
      />
      {toast ? (
        <div
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg"
          role="status">
          {toast.message}
        </div>
      ) : null}
    </main>
  )
}

export const App = (): ReactElement => {
  if (window.location.pathname === '/loading') {
    return <LoadingRoute />
  }

  return <PreviewRoute />
}
