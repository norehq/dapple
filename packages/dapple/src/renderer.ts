import { WebGlDappleRenderer } from './renderer/web-gl-dapple-renderer'
import type { DappleRenderer, DappleRendererOptions } from './types'

export const createDappleRenderer = (
  container: HTMLElement,
  options?: DappleRendererOptions,
): DappleRenderer => new WebGlDappleRenderer(container, options)

export { DEFAULT_SETTINGS } from './configs'
