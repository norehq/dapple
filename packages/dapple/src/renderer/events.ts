import type {
  DappleErrorEvent,
  DappleLoadEvent,
  DappleLoadStartEvent,
  DappleRendererOptions,
  DappleRenderEvent,
  DappleResizeEvent,
  DappleResourcesReadyEvent,
  DappleSource,
} from '../types'
import type { SceneResources } from '../webgl/resources'

export type RendererCallbacks = Pick<
  DappleRendererOptions,
  'onError' | 'onLoad' | 'onLoadStart' | 'onRender' | 'onResize' | 'onResourcesReady'
>

export const callbacksFromOptions = (
  options: DappleRendererOptions,
): RendererCallbacks => ({
  onError: options.onError,
  onLoad: options.onLoad,
  onLoadStart: options.onLoadStart,
  onRender: options.onRender,
  onResize: options.onResize,
  onResourcesReady: options.onResourcesReady,
})

export const emitError = (
  callbacks: RendererCallbacks,
  error: Error,
  source?: DappleSource,
) => {
  const event: DappleErrorEvent = {
    error,
    source,
    timestamp: performance.now(),
  }

  callbacks.onError?.(error, event)
}

export const emitLoad = (
  callbacks: RendererCallbacks,
  source: DappleSource,
  imageElement: HTMLImageElement,
  resources: SceneResources | null,
) => {
  const event: DappleLoadEvent = {
    imageElement,
    imageHeight: imageElement.height,
    imageWidth: imageElement.width,
    renderHeight: resources?.renderHeight,
    renderWidth: resources?.renderWidth,
    source,
    timestamp: performance.now(),
  }

  callbacks.onLoad?.(event)
}

export const emitLoadStart = (
  callbacks: RendererCallbacks,
  source: DappleSource,
) => {
  const event: DappleLoadStartEvent = {
    source,
    timestamp: performance.now(),
  }

  callbacks.onLoadStart?.(event)
}

export const emitRender = (
  callbacks: RendererCallbacks,
  event: Omit<DappleRenderEvent, 'timestamp'>,
) => {
  callbacks.onRender?.({
    ...event,
    timestamp: performance.now(),
  })
}

export const emitResize = (
  callbacks: RendererCallbacks,
  event: Omit<DappleResizeEvent, 'timestamp'>,
) => {
  callbacks.onResize?.({
    ...event,
    timestamp: performance.now(),
  })
}

export const emitResourcesReady = (
  callbacks: RendererCallbacks,
  resources: SceneResources,
) => {
  const event: DappleResourcesReadyEvent = {
    powerPreference: resources.powerPreference,
    timestamp: performance.now(),
  }

  callbacks.onResourcesReady?.(event)
}
