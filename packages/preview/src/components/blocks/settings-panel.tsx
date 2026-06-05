import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DatabaseExportIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type {
  DappleMarkMode,
  DapplePresentationMode,
  DappleSettings,
} from '@unix/dapple'
import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import {
  DEFAULT_MARK_MODE,
  DEFAULT_PREVIEW_SETTINGS,
  INTERACTION_END_DELAY_MS,
  PRESETS_BY_MODE,
  PREVIEW_QUALITY_SETTINGS,
  type NumericSetting,
  type Preset,
  type PresetId,
  type PreviewQuality,
} from '@/config'
import { AdvancedControls } from './advanced-controls'
import { ModeQualityControls } from './mode-quality-controls'
import { PresetControls } from './preset-controls'
import { SliderControls } from './slider-controls'

type SettingsPanelProps = {
  defaultPresentationMode: DapplePresentationMode
  onBaseSettingsChange: (settings: Partial<DappleSettings>) => void
  onNotify: (message: string) => void
  onPreviewSettingsChange: (settings: Partial<DappleSettings>) => void
  resetVersion: number
}

export const SettingsPanel = ({
  defaultPresentationMode,
  onBaseSettingsChange,
  onNotify,
  onPreviewSettingsChange,
  resetVersion,
}: SettingsPanelProps): ReactElement => {
  const [activePresetId, setActivePresetId] = useState<PresetId | 'custom'>(
    'lines-contour',
  )
  const [isInteracting, setIsInteracting] = useState(false)
  const [markMode, setMarkMode] = useState<DappleMarkMode>(DEFAULT_MARK_MODE)
  const [previewQuality, setPreviewQuality] = useState<PreviewQuality>('high')
  const [settings, setSettings] = useState<Partial<DappleSettings>>(
    () => ({
      ...DEFAULT_PREVIEW_SETTINGS,
      presentationMode: defaultPresentationMode,
    }),
  )
  const interactionEndTimeoutRef = useRef<number | null>(null)
  const pendingSettingsRef = useRef<Partial<DappleSettings> | null>(null)
  const settingsFrameRef = useRef<number | null>(null)
  const modePresets = PRESETS_BY_MODE[markMode]
  const activePreset = modePresets.find(preset => preset.id === activePresetId)

  const flushSettingsPatch = useCallback(() => {
    if (settingsFrameRef.current !== null) {
      window.cancelAnimationFrame(settingsFrameRef.current)
      settingsFrameRef.current = null
    }

    const pendingSettings = pendingSettingsRef.current

    if (!pendingSettings) {
      return
    }

    pendingSettingsRef.current = null
    setSettings(current => ({
      ...current,
      ...pendingSettings,
    }))
  }, [])

  const scheduleSettingsPatch = useCallback(
    (patch: Partial<DappleSettings>) => {
      pendingSettingsRef.current = {
        ...pendingSettingsRef.current,
        ...patch,
      }

      if (settingsFrameRef.current !== null) {
        return
      }

      settingsFrameRef.current = window.requestAnimationFrame(() => {
        settingsFrameRef.current = null
        flushSettingsPatch()
      })
    },
    [flushSettingsPatch],
  )

  const startPreviewInteraction = useCallback(() => {
    if (interactionEndTimeoutRef.current !== null) {
      window.clearTimeout(interactionEndTimeoutRef.current)
      interactionEndTimeoutRef.current = null
    }

    setIsInteracting(true)
  }, [])

  useEffect(
    () => () => {
      if (settingsFrameRef.current !== null) {
        window.cancelAnimationFrame(settingsFrameRef.current)
      }

      if (interactionEndTimeoutRef.current !== null) {
        window.clearTimeout(interactionEndTimeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    const defaultPreset = PRESETS_BY_MODE[markMode][0]

    flushSettingsPatch()
    setActivePresetId(defaultPreset.id)
    setSettings(current => ({
      ...defaultPreset.settings,
      presentationMode: current.presentationMode ?? defaultPresentationMode,
    }))
  }, [defaultPresentationMode, flushSettingsPatch, markMode, resetVersion])

  useEffect(() => {
    onBaseSettingsChange(settings)
  }, [onBaseSettingsChange, settings])

  const previewSettings = useMemo<Partial<DappleSettings>>(
    () => ({
      ...settings,
      ...PREVIEW_QUALITY_SETTINGS[previewQuality],
      markMode,
      presentationMode: settings.presentationMode ?? defaultPresentationMode,
      renderStrategy: isInteracting ? 'continuous' : 'static',
    }),
    [defaultPresentationMode, isInteracting, markMode, previewQuality, settings],
  )

  useEffect(() => {
    onPreviewSettingsChange(previewSettings)
  }, [onPreviewSettingsChange, previewSettings])

  const updateSetting = <Key extends keyof DappleSettings>(
    key: Key,
    value: DappleSettings[Key],
  ) => {
    flushSettingsPatch()
    setActivePresetId('custom')
    setSettings(current => ({
      ...current,
      [key]: value,
    }))
  }

  const updateNumericSetting = (key: NumericSetting, value: number) => {
    startPreviewInteraction()
    setActivePresetId('custom')
    scheduleSettingsPatch({ [key]: value } as Partial<DappleSettings>)

    if (interactionEndTimeoutRef.current !== null) {
      window.clearTimeout(interactionEndTimeoutRef.current)
    }

    interactionEndTimeoutRef.current = window.setTimeout(() => {
      interactionEndTimeoutRef.current = null
      flushSettingsPatch()
      setIsInteracting(false)
    }, INTERACTION_END_DELAY_MS)
  }

  const applyPreset = (preset: Preset) => {
    flushSettingsPatch()
    setActivePresetId(preset.id)
    setSettings(current => ({
      ...preset.settings,
      presentationMode: current.presentationMode ?? defaultPresentationMode,
    }))
  }

  const updateMarkMode = (nextMarkMode: DappleMarkMode) => {
    const nextPreset = PRESETS_BY_MODE[nextMarkMode][0]

    flushSettingsPatch()
    setMarkMode(nextMarkMode)
    setActivePresetId(nextPreset.id)
    setSettings(current => ({
      ...nextPreset.settings,
      presentationMode: current.presentationMode ?? defaultPresentationMode,
    }))
  }

  const exportSettings = async () => {
    const currentSettings = {
      ...settings,
      ...pendingSettingsRef.current,
    }
    const exportObject = {
      presetId: activePresetId,
      presetLabel: activePreset?.label ?? null,
      previewQuality,
      settings: {
        ...currentSettings,
        ...PREVIEW_QUALITY_SETTINGS[previewQuality],
        markMode,
        presentationMode:
          currentSettings.presentationMode ?? defaultPresentationMode,
        renderStrategy: 'static',
      },
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportObject, null, 2))
      onNotify('Settings copied to clipboard.')
    } catch {
      onNotify('Settings could not be copied.')
    }
  }

  return (
    <aside className="flex min-h-0 flex-col gap-5 rounded-lg border bg-card p-3 min-[981px]:overflow-auto">
      <ModeQualityControls
        markMode={markMode}
        onMarkModeChange={updateMarkMode}
        onPreviewQualityChange={setPreviewQuality}
        previewQuality={previewQuality}
      />
      <PresetControls
        activePresetId={activePresetId}
        onApplyPreset={applyPreset}
        presets={modePresets}
      />
      <SliderControls
        markMode={markMode}
        onNumericSettingChange={updateNumericSetting}
        settings={settings}
      />
      <AdvancedControls
        markMode={markMode}
        onSettingChange={updateSetting}
        settings={settings}
      />
      <div className="mt-auto flex justify-end pt-1">
        <Button onClick={exportSettings} size="sm" type="button" variant="outline">
          <HugeiconsIcon icon={DatabaseExportIcon} />
          Export settings
        </Button>
      </div>
    </aside>
  )
}
