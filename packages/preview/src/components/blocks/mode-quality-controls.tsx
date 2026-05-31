import type { DappleMarkMode } from '@norehq/dapple'
import type { ReactElement } from 'react'

import {
  MARK_MODE_OPTIONS,
  PREVIEW_QUALITY_OPTIONS,
  type PreviewQuality,
} from '@/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ModeQualityControlsProps = {
  markMode: DappleMarkMode
  onMarkModeChange: (markMode: DappleMarkMode) => void
  onPreviewQualityChange: (quality: PreviewQuality) => void
  previewQuality: PreviewQuality
}

export const ModeQualityControls = ({
  markMode,
  onMarkModeChange,
  onPreviewQualityChange,
  previewQuality,
}: ModeQualityControlsProps): ReactElement => (
  <section className="grid grid-cols-2 gap-3">
    <label className="grid gap-2">
      <span className="text-sm font-medium">Mode</span>
      <Select
        onValueChange={value => onMarkModeChange(value as DappleMarkMode)}
        value={markMode}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MARK_MODE_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>

    <label className="grid gap-2">
      <span className="text-sm font-medium">Quality</span>
      <Select
        onValueChange={value => onPreviewQualityChange(value as PreviewQuality)}
        value={previewQuality}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PREVIEW_QUALITY_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  </section>
)
