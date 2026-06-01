export type DappleImageFit = 'contain' | 'cover'

export type DappleToneTarget = 'light' | 'dark'

export type DappleRenderStrategy = 'continuous' | 'static'

export type DappleDotSampleMode = 'center' | 'multi'

export type DappleMarkMode = 'dots' | 'hybrid' | 'lines'

export type DapplePowerPreference = 'default' | 'high-performance' | 'low-power'

export type DapplePresentationMode = 'composited' | 'direct'

export type DappleSource = {
  crossOrigin?: HTMLImageElement['crossOrigin']
  imageElement?: HTMLImageElement
  imageUrl?: string
}

export type DapplePlaceholder = {
  backgroundColor?: string
  dashColor?: string
  opacity?: number
  size?: number
}

export type DappleSettings = {
  backgroundColor: string
  contrast: number
  dashColor: string
  dotGamma: number
  dotMinRadius: number
  dotSampleMode: DappleDotSampleMode
  dotScale: number
  dotSoftness: number
  fit: DappleImageFit
  highlightRolloff: number
  lineSoftness: number
  lineStrength: number
  lineWidth: number
  markMode: DappleMarkMode
  maxPixelRatio: number
  maxRenderPixels: number
  power: number
  powerPreference: DapplePowerPreference
  presentationMode: DapplePresentationMode
  renderStrategy: DappleRenderStrategy
  performanceLogging: boolean
  shadowBoost: number
  tileSize: number
  toneTarget: DappleToneTarget
  transparent: boolean
  zoom: number
}

export type DappleRendererLifecycleEvent = {
  timestamp: number
}

export type DappleErrorEvent = DappleRendererLifecycleEvent & {
  error: Error
  source?: DappleSource
}

export type DappleLoadStartEvent = DappleRendererLifecycleEvent & {
  source: DappleSource
}

export type DappleLoadEvent = DappleRendererLifecycleEvent & {
  imageElement: HTMLImageElement
  imageHeight: number
  imageWidth: number
  renderHeight?: number
  renderWidth?: number
  source: DappleSource
}

export type DappleRenderEvent = DappleRendererLifecycleEvent & {
  markMode: DappleMarkMode
  renderHeight: number
  renderStrategy: DappleRenderStrategy
  renderWidth: number
}

export type DappleResizeEvent = DappleRendererLifecycleEvent & {
  cssHeight: number
  cssWidth: number
  pixelRatio: number
  renderHeight: number
  renderPixels: number
  renderWidth: number
}

export type DappleResourcesReadyEvent = DappleRendererLifecycleEvent & {
  powerPreference: DapplePowerPreference
}

export type DappleSnapshotOptions = {
  quality?: number
  type?: string
}

export type DappleErrorHandler = (error: Error, event: DappleErrorEvent) => void

export type DappleLoadStartHandler = (event: DappleLoadStartEvent) => void

export type DappleLoadHandler = (event: DappleLoadEvent) => void

export type DappleRenderHandler = (event: DappleRenderEvent) => void

export type DappleResizeHandler = (event: DappleResizeEvent) => void

export type DappleResourcesReadyHandler = (event: DappleResourcesReadyEvent) => void

export type DappleRendererOptions = {
  onError?: DappleErrorHandler
  onLoad?: DappleLoadHandler
  onLoadStart?: DappleLoadStartHandler
  onRender?: DappleRenderHandler
  onResize?: DappleResizeHandler
  onResourcesReady?: DappleResourcesReadyHandler
  placeholder?: DapplePlaceholder | false
  settings?: Partial<DappleSettings>
  source?: DappleSource
}

export type DappleRenderer = {
  clear: () => void
  dispose: () => void
  load: (source: DappleSource) => Promise<void>
  renderPlaceholder: (placeholder?: DapplePlaceholder | false) => void
  resize: () => void
  snapshot: (options?: DappleSnapshotOptions) => Promise<Blob>
  start: () => void
  stop: () => void
  update: (settings: Partial<DappleSettings>) => void
}
