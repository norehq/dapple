import type { ReactElement } from 'react'

import { Slider } from '@/components/ui/slider'

type ControlSliderProps = {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  value: number
}

export const ControlSlider = ({
  label,
  max,
  min,
  onChange,
  step,
  value,
}: ControlSliderProps): ReactElement => (
  <label className="grid gap-2">
    <span className="flex items-center justify-between text-xs text-muted-foreground">
      {label}
      <strong className="font-medium text-foreground">{value}</strong>
    </span>
    <Slider
      max={max}
      min={min}
      onValueChange={nextValue => {
        onChange(Array.isArray(nextValue) ? (nextValue[0] ?? value) : nextValue)
      }}
      step={step}
      value={[value]}
    />
  </label>
)
