import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Preset, PresetId } from '@/config'

type PresetControlsProps = {
  activePresetId: PresetId | 'custom'
  onApplyPreset: (preset: Preset) => void
  presets: Preset[]
}

export const PresetControls = ({
  activePresetId,
  onApplyPreset,
  presets,
}: PresetControlsProps): ReactElement => (
  <section className="grid gap-2">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-medium">Presets</h2>
      {activePresetId === 'custom' ? (
        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          Custom
        </span>
      ) : null}
    </div>
    <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 min-[981px]:grid-cols-2">
      {presets.map(preset => (
        <Button
          aria-pressed={activePresetId === preset.id}
          className={cn(
            'h-auto min-w-0 items-start justify-start whitespace-normal px-2 py-2 text-left',
            activePresetId === preset.id && 'ring-2 ring-ring/30',
          )}
          key={preset.id}
          onClick={() => onApplyPreset(preset)}
          type="button"
          variant={activePresetId === preset.id ? 'default' : 'outline'}>
          <span className="grid min-w-0 gap-0.5 whitespace-normal">
            <span className="min-w-0 break-words">{preset.label}</span>
            <span className="whitespace-normal break-words text-[0.625rem] leading-snug font-normal opacity-70 max-[980px]:hidden">
              {preset.description}
            </span>
          </span>
        </Button>
      ))}
    </div>
  </section>
)
