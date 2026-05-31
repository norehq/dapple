import type {
  DappleDotSampleMode,
  DappleImageFit,
  DappleMarkMode,
  DappleSettings,
  DappleToneTarget,
} from '@norehq/dapple'
import type { ReactElement } from 'react'

import {
  DOT_SAMPLE_MODE_OPTIONS,
  IMAGE_FIT_OPTIONS,
  TONE_TARGET_OPTIONS,
} from '@/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AdvancedControlsProps = {
  markMode: DappleMarkMode
  onSettingChange: <Key extends keyof DappleSettings>(
    key: Key,
    value: DappleSettings[Key],
  ) => void
  settings: Partial<DappleSettings>
}

export const AdvancedControls = ({
  markMode,
  onSettingChange,
  settings,
}: AdvancedControlsProps): ReactElement => (
  <section className="grid grid-cols-2 gap-2">
    {markMode !== 'lines' ? (
      <label className="grid gap-2">
        <span className="text-xs text-muted-foreground">Sample</span>
        <Select
          onValueChange={value =>
            onSettingChange('dotSampleMode', value as DappleDotSampleMode)
          }
          value={settings.dotSampleMode ?? 'multi'}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOT_SAMPLE_MODE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    ) : null}

    <label className="grid gap-2">
      <span className="text-xs text-muted-foreground">Tone target</span>
      <Select
        onValueChange={value =>
          onSettingChange('toneTarget', value as DappleToneTarget)
        }
        value={settings.toneTarget ?? 'light'}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TONE_TARGET_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>

    <label className="grid gap-2">
      <span className="text-xs text-muted-foreground">Fit</span>
      <Select
        onValueChange={value => onSettingChange('fit', value as DappleImageFit)}
        value={settings.fit ?? 'cover'}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {IMAGE_FIT_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  </section>
)
