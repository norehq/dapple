import type {
  DappleDotSampleMode,
  DappleImageFit,
  DappleMarkMode,
  DapplePresentationMode,
  DappleSettings,
  DappleToneTarget,
} from '@norehq/dapple'

export const IMAGE_SOURCES = [
  {
    label: 'Person 01',
    url: '/test-images/person-01.jpg',
  },
  {
    label: 'Person 02',
    url: '/test-images/person-02.jpg',
  },
  {
    label: 'Person 03',
    url: '/test-images/person-03.jpg',
  },
  {
    label: 'Building 01',
    url: '/test-images/building-01.jpg',
  },
  {
    label: 'Building 02',
    url: '/test-images/building-02.jpg',
  },
] as const

export const DEFAULT_IMAGE_INDEX = 0
export const DEFAULT_MARK_MODE: DappleMarkMode = 'lines'
export const INTERACTION_END_DELAY_MS = 140

// The preview briefly clears the source before swapping URLs so the placeholder
// can be inspected and object URL uploads do not race older image decodes.
export const IMAGE_SOURCE_SWAP_DELAY_MS = 420
export const UPLOAD_SOURCE_SWAP_DELAY_MS = 120

export type PresetId =
  | 'dots-studio'
  | 'dots-dense'
  | 'dots-newsprint'
  | 'dots-paper'
  | 'dots-poster'
  | 'hybrid-technical'
  | 'hybrid-engraved'
  | 'hybrid-poster'
  | 'hybrid-paper'
  | 'hybrid-soft'
  | 'lines-contour'
  | 'lines-ink'
  | 'lines-scan'
  | 'lines-paper'
  | 'lines-bold'

export type Preset = {
  description: string
  id: PresetId
  label: string
  settings: Partial<DappleSettings>
}

export type PresetGroup = [Preset, ...Preset[]]

export type PreviewQuality = 'eco' | 'balanced' | 'high'

export type SelectedImageKey = number | 'uploaded'

export type UploadedImage = {
  label: string
  url: string
}

export type NumericSetting = Extract<
  keyof DappleSettings,
  | 'contrast'
  | 'dotGamma'
  | 'dotMinRadius'
  | 'dotScale'
  | 'dotSoftness'
  | 'highlightRolloff'
  | 'lineSoftness'
  | 'lineStrength'
  | 'lineWidth'
  | 'power'
  | 'shadowBoost'
  | 'tileSize'
  | 'zoom'
>

export type SliderControl = {
  defaultValue: number
  key: NumericSetting
  label: string
  max: number
  min: number
  step: number
}

export const PREVIEW_QUALITY_SETTINGS: Record<
  PreviewQuality,
  Pick<DappleSettings, 'maxPixelRatio' | 'maxRenderPixels' | 'powerPreference'>
> = {
  balanced: {
    maxPixelRatio: 1.5,
    maxRenderPixels: 2_000_000,
    powerPreference: 'default',
  },
  eco: {
    maxPixelRatio: 1,
    maxRenderPixels: 1_200_000,
    powerPreference: 'low-power',
  },
  high: {
    maxPixelRatio: 2,
    maxRenderPixels: 4_000_000,
    powerPreference: 'high-performance',
  },
}

export const DEFAULT_PREVIEW_SETTINGS: Partial<DappleSettings> = {
  backgroundColor: '#000000',
  contrast: 1,
  dashColor: '#959595',
  dotGamma: 1,
  dotMinRadius: 0,
  dotSampleMode: 'center',
  dotScale: 0.55,
  dotSoftness: 0.022,
  fit: 'cover',
  highlightRolloff: 0,
  lineSoftness: 0.02,
  lineStrength: 1,
  lineWidth: 0.45,
  performanceLogging: true,
  power: -0.1,
  renderStrategy: 'static',
  shadowBoost: 0,
  tileSize: 10,
  toneTarget: 'light',
  zoom: 1.25,
}

export const PRESETS_BY_MODE: Record<DappleMarkMode, PresetGroup> = {
  dots: [
    {
      description: 'Balanced portrait dots with a dark editorial field.',
      id: 'dots-studio',
      label: 'Studio',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        contrast: 1.06,
        dashColor: '#d0d2cc',
        dotGamma: 0.88,
        dotScale: 0.78,
        power: -0.01,
        shadowBoost: 0.18,
        tileSize: 6,
        zoom: 1,
      },
    },
    {
      description: 'Tighter grid for fine facial detail and soft tone steps.',
      id: 'dots-dense',
      label: 'Dense',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        contrast: 1.08,
        dashColor: '#c8cac4',
        dotGamma: 0.8,
        dotSampleMode: 'multi',
        dotScale: 0.72,
        dotSoftness: 0.018,
        power: 0,
        shadowBoost: 0.2,
        tileSize: 5,
        zoom: 1,
      },
    },
    {
      description: 'Warmer spacing, lower contrast, and a printed-paper rhythm.',
      id: 'dots-newsprint',
      label: 'Newsprint',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        backgroundColor: '#161616',
        contrast: 1.02,
        dashColor: '#b6b8b0',
        dotGamma: 0.96,
        dotScale: 0.78,
        dotSoftness: 0.028,
        power: -0.03,
        shadowBoost: 0.14,
        tileSize: 8,
        zoom: 1,
      },
    },
    {
      description: 'Dark ink dots on a light surface.',
      id: 'dots-paper',
      label: 'Paper',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        backgroundColor: '#f6f4ed',
        contrast: 1.25,
        dashColor: '#121212',
        dotGamma: 1.02,
        dotScale: 0.58,
        highlightRolloff: 0.02,
        shadowBoost: 0.04,
        toneTarget: 'dark',
        zoom: 1,
      },
    },
    {
      description: 'Larger visible dots for posters and thumbnails.',
      id: 'dots-poster',
      label: 'Poster',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        contrast: 1.18,
        dashColor: '#d7d8d2',
        dotGamma: 0.74,
        dotMinRadius: 0.004,
        dotScale: 0.9,
        dotSoftness: 0.022,
        power: 0.04,
        shadowBoost: 0.1,
        tileSize: 9,
        zoom: 1,
      },
    },
  ],
  hybrid: [
    {
      description: 'Fine dots with continuous ink detail.',
      id: 'hybrid-technical',
      label: 'Technical',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        contrast: 1.08,
        dashColor: '#d0d2cc',
        dotGamma: 0.88,
        dotSampleMode: 'multi',
        dotScale: 0.62,
        highlightRolloff: 0.03,
        lineSoftness: 0.02,
        lineStrength: 0.58,
        lineWidth: 0.36,
        power: -0.02,
        shadowBoost: 0.16,
        tileSize: 6,
        zoom: 1,
      },
    },
    {
      description: 'Bright etched strokes over compact tonal dots.',
      id: 'hybrid-engraved',
      label: 'Engraved',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        contrast: 1.14,
        dashColor: '#d8dad4',
        dotGamma: 0.84,
        dotSampleMode: 'multi',
        dotScale: 0.58,
        highlightRolloff: 0.03,
        lineSoftness: 0.02,
        lineStrength: 0.68,
        lineWidth: 0.4,
        power: 0,
        shadowBoost: 0.15,
        tileSize: 6,
        zoom: 1,
      },
    },
    {
      description: 'Graphic dots and assertive line work for thumbnails.',
      id: 'hybrid-poster',
      label: 'Posterline',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        contrast: 1.2,
        dashColor: '#dedfd8',
        dotGamma: 0.78,
        dotMinRadius: 0,
        dotScale: 0.72,
        highlightRolloff: 0.02,
        lineSoftness: 0.02,
        lineStrength: 0.72,
        lineWidth: 0.44,
        power: 0.04,
        shadowBoost: 0.12,
        tileSize: 8,
        zoom: 1,
      },
    },
    {
      description: 'Dot and scanline marks on a pale sheet.',
      id: 'hybrid-paper',
      label: 'Draft',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        backgroundColor: '#f6f4ed',
        contrast: 1.22,
        dashColor: '#121212',
        dotGamma: 1.05,
        dotScale: 0.52,
        highlightRolloff: 0.02,
        lineSoftness: 0.02,
        lineStrength: 0.52,
        lineWidth: 0.36,
        shadowBoost: 0.08,
        toneTarget: 'dark',
        zoom: 1,
      },
    },
    {
      description: 'Low contrast texture with restrained connecting strokes.',
      id: 'hybrid-soft',
      label: 'Soft Mix',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        contrast: 1.02,
        dashColor: '#b8bab2',
        dotGamma: 1,
        dotScale: 0.72,
        dotSoftness: 0.032,
        highlightRolloff: 0.06,
        lineSoftness: 0.02,
        lineStrength: 0.44,
        lineWidth: 0.32,
        power: -0.04,
        shadowBoost: 0.12,
        tileSize: 7,
        zoom: 1,
      },
    },
  ],
  lines: [
    {
      description: 'Balanced contour marks with a steady static rhythm.',
      id: 'lines-contour',
      label: 'Contour',
      settings: DEFAULT_PREVIEW_SETTINGS,
    },
    {
      description: 'Slightly tighter bands with more visible midtone structure.',
      id: 'lines-ink',
      label: 'Tight',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        lineWidth: 0.4,
        power: -0.06,
        tileSize: 8,
      },
    },
    {
      description: 'Thin scanline texture with quiet tone.',
      id: 'lines-scan',
      label: 'Scanline',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        dashColor: '#777777',
        lineStrength: 0.86,
        lineWidth: 0.34,
        power: -0.12,
        tileSize: 7,
      },
    },
    {
      description: 'Dark line marks on a light surface.',
      id: 'lines-paper',
      label: 'Charcoal',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        backgroundColor: '#f4f0e4',
        dashColor: '#111111',
        lineStrength: 0.82,
        lineWidth: 0.42,
        power: -0.08,
        tileSize: 10,
        toneTarget: 'dark',
      },
    },
    {
      description: 'Broader static bars for thumbnail-scale readability.',
      id: 'lines-bold',
      label: 'Bold',
      settings: {
        ...DEFAULT_PREVIEW_SETTINGS,
        dashColor: '#b6b6b6',
        lineWidth: 0.62,
        power: -0.04,
        tileSize: 12,
      },
    },
  ],
}

export const PRIMARY_SLIDER_CONTROLS: SliderControl[] = [
  {
    defaultValue: 10,
    key: 'tileSize',
    label: 'Tile',
    max: 24,
    min: 2,
    step: 1,
  },
  {
    defaultValue: 1,
    key: 'dotGamma',
    label: 'Tone gamma',
    max: 2.2,
    min: 0.35,
    step: 0.01,
  },
]

export const DOT_SLIDER_CONTROLS: SliderControl[] = [
  {
    defaultValue: 0.55,
    key: 'dotScale',
    label: 'Dot scale',
    max: 1.4,
    min: 0.15,
    step: 0.01,
  },
  {
    defaultValue: 0,
    key: 'dotMinRadius',
    label: 'Min dot',
    max: 0.22,
    min: 0,
    step: 0.005,
  },
  {
    defaultValue: 0.022,
    key: 'dotSoftness',
    label: 'Dot edge',
    max: 0.08,
    min: 0.002,
    step: 0.001,
  },
]

export const TONE_SLIDER_CONTROLS: SliderControl[] = [
  {
    defaultValue: -0.1,
    key: 'power',
    label: 'Power',
    max: 0.8,
    min: -0.8,
    step: 0.01,
  },
  {
    defaultValue: 1,
    key: 'contrast',
    label: 'Contrast',
    max: 2,
    min: 0.2,
    step: 0.05,
  },
]

export const DOT_TONE_SLIDER_CONTROLS: SliderControl[] = [
  {
    defaultValue: 0,
    key: 'highlightRolloff',
    label: 'Highlight rolloff',
    max: 1,
    min: 0,
    step: 0.01,
  },
  {
    defaultValue: 0,
    key: 'shadowBoost',
    label: 'Shadow boost',
    max: 1,
    min: 0,
    step: 0.01,
  },
]

export const ZOOM_SLIDER_CONTROLS: SliderControl[] = [
  {
    defaultValue: 1.25,
    key: 'zoom',
    label: 'Zoom',
    max: 1.8,
    min: 0.65,
    step: 0.01,
  },
]

export const LINE_SLIDER_CONTROLS: SliderControl[] = [
  {
    defaultValue: 0.45,
    key: 'lineWidth',
    label: 'Line width',
    max: 1.4,
    min: 0.05,
    step: 0.01,
  },
  {
    defaultValue: 1,
    key: 'lineStrength',
    label: 'Line strength',
    max: 2,
    min: 0,
    step: 0.05,
  },
  {
    defaultValue: 0.02,
    key: 'lineSoftness',
    label: 'Line edge',
    max: 0.12,
    min: 0.001,
    step: 0.001,
  },
]

export const MARK_MODE_OPTIONS: Array<{
  label: string
  value: DappleMarkMode
}> = [
  { label: 'Lines', value: 'lines' },
  { label: 'Dots', value: 'dots' },
  { label: 'Hybrid', value: 'hybrid' },
]

export const PREVIEW_QUALITY_OPTIONS: Array<{
  label: string
  value: PreviewQuality
}> = [
  { label: 'Eco', value: 'eco' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'High', value: 'high' },
]

export const DOT_SAMPLE_MODE_OPTIONS: Array<{
  label: string
  value: DappleDotSampleMode
}> = [
  { label: 'Multi', value: 'multi' },
  { label: 'Center', value: 'center' },
]

export const TONE_TARGET_OPTIONS: Array<{
  label: string
  value: DappleToneTarget
}> = [
  { label: 'Light areas', value: 'light' },
  { label: 'Dark areas', value: 'dark' },
]

export const IMAGE_FIT_OPTIONS: Array<{
  label: string
  value: DappleImageFit
}> = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
]

export const PRESENTATION_MODE_OPTIONS: Array<{
  label: string
  value: DapplePresentationMode
}> = [
  { label: 'Direct', value: 'direct' },
  { label: 'Composited', value: 'composited' },
]
