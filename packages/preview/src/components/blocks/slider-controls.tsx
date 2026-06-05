import type { DappleMarkMode, DappleSettings } from '@unix/dapple'
import type { ReactElement } from 'react'

import {
  DOT_SLIDER_CONTROLS,
  DOT_TONE_SLIDER_CONTROLS,
  LINE_SLIDER_CONTROLS,
  PRIMARY_SLIDER_CONTROLS,
  TONE_SLIDER_CONTROLS,
  ZOOM_SLIDER_CONTROLS,
  type NumericSetting,
  type SliderControl,
} from '@/config'
import { ControlSlider } from './control-slider'

type SliderControlsProps = {
  markMode: DappleMarkMode
  onNumericSettingChange: (key: NumericSetting, value: number) => void
  settings: Partial<DappleSettings>
}

const sliderValue = (
  settings: Partial<DappleSettings>,
  control: SliderControl,
): number => settings[control.key] ?? control.defaultValue

const renderSlider = (
  control: SliderControl,
  settings: Partial<DappleSettings>,
  onNumericSettingChange: (key: NumericSetting, value: number) => void,
): ReactElement => (
  <ControlSlider
    key={control.key}
    label={control.label}
    max={control.max}
    min={control.min}
    onChange={value => onNumericSettingChange(control.key, value)}
    step={control.step}
    value={sliderValue(settings, control)}
  />
)

export const SliderControls = ({
  markMode,
  onNumericSettingChange,
  settings,
}: SliderControlsProps): ReactElement => (
  <section className="grid grid-cols-2 gap-x-3 gap-y-5">
    {PRIMARY_SLIDER_CONTROLS.map(control =>
      renderSlider(control, settings, onNumericSettingChange),
    )}
    {markMode !== 'lines'
      ? DOT_SLIDER_CONTROLS.map(control =>
          renderSlider(control, settings, onNumericSettingChange),
        )
      : null}
    {TONE_SLIDER_CONTROLS.map(control =>
      renderSlider(control, settings, onNumericSettingChange),
    )}
    {markMode !== 'lines'
      ? DOT_TONE_SLIDER_CONTROLS.map(control =>
          renderSlider(control, settings, onNumericSettingChange),
        )
      : null}
    {ZOOM_SLIDER_CONTROLS.map(control =>
      renderSlider(control, settings, onNumericSettingChange),
    )}
    {markMode !== 'dots'
      ? LINE_SLIDER_CONTROLS.map(control =>
          renderSlider(control, settings, onNumericSettingChange),
        )
      : null}
  </section>
)
