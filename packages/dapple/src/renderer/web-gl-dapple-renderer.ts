import {
  CONTINUOUS_RENDER_LOG_INTERVAL,
  STATIC_RENDER_LOG_INTERVAL,
  mergePlaceholder,
  mergeSettings,
} from '../configs'
import {
  applyPlaceholderStyles,
  applyRootStyles,
  createPlaceholderElement,
  createRootElement,
  setElementVisible,
} from '../dom/elements'
import { loadImage } from '../resources/images'
import { calculateRenderSize } from '../resources/sizes'
import {
  createSceneResources,
  disposeSceneResources,
  type SceneResources,
} from '../webgl/resources'
import {
  clearScene,
  renderEffectScene,
  syncSettingsUniforms,
  syncViewportUniforms,
  uploadImageTexture,
} from './drawing'
import {
  callbacksFromOptions,
  emitError,
  emitLoad,
  emitLoadStart,
  emitRender,
  emitResize,
  emitResourcesReady,
  type RendererCallbacks,
} from './events'
import {
  canvasBlob,
  renderPresentationScene,
  resizePresentationTarget,
  snapshotCanvas,
} from './presentation'
import type {
  DapplePlaceholder,
  DappleRenderer,
  DappleRendererOptions,
  DappleSettings,
  DappleSnapshotOptions,
  DappleSource,
} from '../types'

export class WebGlDappleRenderer implements DappleRenderer {
  private static NormalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }

    return new Error(String(error))
  }

  private static RenderLogInterval(settings: DappleSettings): number {
    if (settings.renderStrategy === 'continuous') {
      return CONTINUOUS_RENDER_LOG_INTERVAL
    }

    return STATIC_RENDER_LOG_INTERVAL
  }

  private static ShouldRecreateResources(
    previousSettings: DappleSettings,
    nextSettings: DappleSettings,
  ): boolean {
    return previousSettings.powerPreference !== nextSettings.powerPreference
      || previousSettings.presentationMode !== nextSettings.presentationMode
  }

  private static ShouldResize(
    previousSettings: DappleSettings,
    nextSettings: DappleSettings,
  ): boolean {
    return (
      previousSettings.maxPixelRatio !== nextSettings.maxPixelRatio ||
      previousSettings.maxRenderPixels !== nextSettings.maxRenderPixels
    )
  }

  private animationFrame: number | null = null
  private readonly callbacks: RendererCallbacks
  private readonly container: HTMLElement
  private disposed = false
  private imageElement: HTMLImageElement | null = null
  private lastRenderLogAt = 0
  private loadSequence = 0
  private readonly placeholderElement: HTMLDivElement
  private readonly resizeObserver: ResizeObserver
  private resources: SceneResources | null = null
  private readonly root: HTMLDivElement
  private settings: DappleSettings
  private textureKey = ''
  private wasContinuousBeforeHidden = false

  constructor(container: HTMLElement, options: DappleRendererOptions = {}) {
    const placeholderSettings = mergePlaceholder(
      options.placeholder === false ? undefined : options.placeholder,
    )

    this.callbacks = callbacksFromOptions(options)
    this.container = container
    this.settings = mergeSettings(options.settings)
    this.root = createRootElement(this.settings)
    this.placeholderElement = createPlaceholderElement(placeholderSettings)
    this.root.appendChild(this.placeholderElement)
    this.container.appendChild(this.root)
    this.renderPlaceholder(options.placeholder)
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this.container)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    if (options.source) {
      void this.load(options.source)
    }
  }

  clear() {
    this.loadSequence += 1
    this.clearCurrentImage()
  }

  dispose() {
    this.disposed = true
    this.stop()
    this.resizeObserver.disconnect()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.disposeResources()
    this.root.remove()
  }

  async load(source: DappleSource): Promise<void> {
    const sequence = ++this.loadSequence

    this.stop()
    emitLoadStart(this.callbacks, source)

    try {
      const image = await loadImage(source)

      if (this.disposed || sequence !== this.loadSequence) {
        return
      }

      this.imageElement = image
      this.textureKey = ''
      this.ensureResources()
      this.resize()
      this.uploadImageTexture()
      this.render(performance.now())
      setElementVisible(this.placeholderElement, false)
      this.log('image-loaded', {
        imageHeight: image.height,
        imageWidth: image.width,
        renderHeight: this.resources?.renderHeight,
        renderWidth: this.resources?.renderWidth,
      })
      emitLoad(this.callbacks, source, image, this.resources)

      if (this.settings.renderStrategy === 'continuous') {
        this.start()
        return
      }

      this.stop()
    } catch (error) {
      emitError(this.callbacks, WebGlDappleRenderer.NormalizeError(error), source)
    }
  }

  renderPlaceholder(placeholder?: DapplePlaceholder | false) {
    if (placeholder === false) {
      this.placeholderElement.style.display = 'none'
      return
    }

    const mergedPlaceholder = mergePlaceholder(placeholder)

    this.placeholderElement.style.display = 'block'
    this.placeholderElement.dataset.opacityValue = String(mergedPlaceholder.opacity)
    applyPlaceholderStyles(this.placeholderElement, mergedPlaceholder)
    setElementVisible(this.placeholderElement, true)
  }

  resize() {
    const resources = this.resources

    if (!resources) {
      return
    }

    const cssWidth = Math.max(this.container.clientWidth, 1)
    const cssHeight = Math.max(this.container.clientHeight, 1)
    const renderSize = calculateRenderSize(cssWidth, cssHeight, this.settings)
    const changed =
      resources.canvas.width !== renderSize.width ||
      resources.canvas.height !== renderSize.height

    if (!changed) {
      syncViewportUniforms(resources, cssWidth, cssHeight)
      return
    }

    resources.renderWidth = renderSize.width
    resources.renderHeight = renderSize.height
    resources.canvas.width = renderSize.width
    resources.canvas.height = renderSize.height
    resizePresentationTarget(resources)
    syncViewportUniforms(resources, cssWidth, cssHeight)
    this.textureKey = ''
    this.uploadImageTexture()

    const resizePayload = {
      cssHeight,
      cssWidth,
      pixelRatio: Number(renderSize.pixelRatio.toFixed(2)),
      renderHeight: renderSize.height,
      renderPixels: renderSize.width * renderSize.height,
      renderWidth: renderSize.width,
    }

    emitResize(this.callbacks, resizePayload)
    this.log('resize', resizePayload)

    if (this.settings.renderStrategy === 'static') {
      this.render(performance.now())
    }
  }

  async snapshot(options: DappleSnapshotOptions = {}): Promise<Blob> {
    const resources = this.resources

    if (!resources || !this.imageElement) {
      throw new Error('No rendered image is available to export.')
    }

    const wasContinuous = this.animationFrame !== null

    this.stop()
    this.uploadImageTexture()
    this.render(performance.now())

    try {
      const canvas = snapshotCanvas(
        resources,
        resources.presentationFramebuffer,
      )

      return await canvasBlob(canvas, options)
    } finally {
      if (wasContinuous || this.settings.renderStrategy === 'continuous') {
        this.start()
      }
    }
  }

  start() {
    if (this.animationFrame !== null || this.disposed || document.hidden) {
      return
    }

    const tick = (timestamp: number) => {
      this.animationFrame = null

      if (this.disposed || document.hidden) {
        return
      }

      this.render(timestamp)

      if (this.settings.renderStrategy === 'continuous') {
        this.animationFrame = window.requestAnimationFrame(tick)
      }
    }

    this.animationFrame = window.requestAnimationFrame(tick)
  }

  stop() {
    if (this.animationFrame === null) {
      return
    }

    window.cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
  }

  update(settings: Partial<DappleSettings>) {
    const previousSettings = this.settings
    const nextSettings = mergeSettings({
      ...this.settings,
      ...settings,
    })

    this.settings = nextSettings
    applyRootStyles(this.root, this.settings)

    if (
      WebGlDappleRenderer.ShouldRecreateResources(previousSettings, nextSettings)
    ) {
      this.disposeResources()
      this.ensureResources()
      this.resize()
      this.uploadImageTexture()
      this.log('power-preference-changed', {
        powerPreference: this.settings.powerPreference,
      })
    } else if (WebGlDappleRenderer.ShouldResize(previousSettings, nextSettings)) {
      this.resize()
    }

    this.syncSettings()

    if (this.settings.renderStrategy === 'continuous') {
      this.start()
      return
    }

    this.stop()
    this.render(performance.now())
  }

  private readonly handleVisibilityChange = () => {
    if (!document.hidden) {
      if (this.wasContinuousBeforeHidden) {
        this.wasContinuousBeforeHidden = false
        this.start()
      }

      return
    }

    this.wasContinuousBeforeHidden = this.animationFrame !== null
    this.stop()
    this.log('paused-hidden-tab')
  }

  private clearCurrentImage() {
    this.stop()
    this.imageElement = null
    this.textureKey = ''

    if (this.resources) {
      clearScene(this.resources)
    }
  }

  private disposeResources() {
    const resources = this.resources

    if (!resources) {
      return
    }

    disposeSceneResources(resources)
    this.resources = null
    this.textureKey = ''
  }

  private ensureResources() {
    if (this.resources) {
      return
    }

    this.resources = createSceneResources(
      this.root,
      this.settings.powerPreference,
      this.settings.presentationMode,
    )
    this.syncSettings()
    this.log('webgl-created', {
      powerPreference: this.settings.powerPreference,
      presentationMode: this.settings.presentationMode,
    })
    emitResourcesReady(this.callbacks, this.resources)
  }

  private log(event: string, payload?: Record<string, unknown>) {
    if (!this.settings.performanceLogging) {
      return
    }

    console.debug('[dapple]', event, payload ?? {})
  }

  private logRenderSample(timestamp: number) {
    if (!this.settings.performanceLogging) {
      return
    }

    if (
      timestamp - this.lastRenderLogAt <
      WebGlDappleRenderer.RenderLogInterval(this.settings)
    ) {
      return
    }

    this.lastRenderLogAt = timestamp
    this.log('render', {
      dotSampleMode: this.settings.dotSampleMode,
      markMode: this.settings.markMode,
      renderHeight: this.resources?.renderHeight,
      renderStrategy: this.settings.renderStrategy,
      renderWidth: this.resources?.renderWidth,
    })
  }

  private render(timestamp: number) {
    const resources = this.resources

    if (!resources || !this.imageElement) {
      return
    }

    if (resources.presentationMode === 'composited') {
      renderEffectScene(resources, this.settings, resources.presentationFramebuffer)
      renderPresentationScene(resources, this.settings)
    } else {
      renderEffectScene(resources, this.settings, null)
    }

    emitRender(this.callbacks, {
      markMode: this.settings.markMode,
      renderHeight: resources.renderHeight,
      renderStrategy: this.settings.renderStrategy,
      renderWidth: resources.renderWidth,
    })
    this.logRenderSample(timestamp)
  }

  private syncSettings() {
    if (!this.resources) {
      return
    }

    syncSettingsUniforms(this.resources, this.settings)
  }

  private uploadImageTexture() {
    const resources = this.resources
    const image = this.imageElement

    if (!resources || !image) {
      return
    }

    const result = uploadImageTexture(resources, image, this.textureKey)

    if (!result) {
      return
    }

    this.textureKey = result.textureKey
    this.log('texture-uploaded', result.logPayload)
  }
}
