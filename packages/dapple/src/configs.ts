import {
  dotsFragmentShader,
  hybridFragmentShader,
  linesFragmentShader,
} from './webgl/shaders'
import type { DappleMarkMode, DapplePlaceholder, DappleSettings } from './types'

export const DEFAULT_SETTINGS: DappleSettings = {
  backgroundColor: '#000000',
  contrast: 1,
  dashColor: '#d0d2cc',
  dotGamma: 0.92,
  dotMinRadius: 0,
  dotSampleMode: 'center',
  dotScale: 0.72,
  dotSoftness: 0.022,
  fit: 'cover',
  highlightRolloff: 0,
  lineSoftness: 0.02,
  lineStrength: 1,
  lineWidth: 0.45,
  markMode: 'dots',
  maxPixelRatio: 2,
  maxRenderPixels: 4_000_000,
  performanceLogging: false,
  power: -0.02,
  powerPreference: 'default',
  renderStrategy: 'static',
  shadowBoost: 0.12,
  tileSize: 10,
  toneTarget: 'light',
  transparent: false,
  zoom: 1.25,
}

export const DEFAULT_PLACEHOLDER: Required<DapplePlaceholder> = {
  backgroundColor: '#050505',
  dashColor: '#696963',
  opacity: 0.55,
  size: 6,
}

export const FINAL_FRAGMENT_SHADERS: Record<DappleMarkMode, string> = {
  dots: dotsFragmentShader,
  hybrid: hybridFragmentShader,
  lines: linesFragmentShader,
}

export const FULLSCREEN_VERTICES = new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
])

export const IMAGE_TEXTURE_UNIT = 0
export const POSITION_ATTRIBUTE_LOCATION = 0

export const STATIC_RENDER_LOG_INTERVAL = 500
export const CONTINUOUS_RENDER_LOG_INTERVAL = 2_000

// These names must stay aligned with the shader uniforms; missing uniforms are
// allowed by WebGL, but misspelled keys silently disable part of the effect.
export const PROGRAM_UNIFORM_KEYS = [
  'applyToDarkAreas',
  'contrast',
  'dotColor',
  'dotGamma',
  'dotMinRadius',
  'dotSampleMode',
  'dotScale',
  'dotSoftness',
  'effectResolution',
  'imageFit',
  'imageSize',
  'highlightRolloff',
  'lineSoftness',
  'lineStrength',
  'lineWidth',
  'power',
  'shadowBoost',
  'tImage',
  'tile',
  'viewportSize',
  'zoom',
] as const

export const mergeSettings = (
  settings?: Partial<DappleSettings>,
): DappleSettings => ({
  ...DEFAULT_SETTINGS,
  ...settings,
})

export const mergePlaceholder = (
  placeholder?: DapplePlaceholder,
): Required<DapplePlaceholder> => ({
  ...DEFAULT_PLACEHOLDER,
  ...placeholder,
})
