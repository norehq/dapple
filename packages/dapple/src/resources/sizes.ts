import type { DappleSettings } from '../types'

export type RenderSize = {
  height: number
  pixelRatio: number
  width: number
}

export const calculateRenderSize = (
  width: number,
  height: number,
  settings: DappleSettings,
): RenderSize => {
  const maxPixelRatio = Math.max(settings.maxPixelRatio, 0.25)
  const rawPixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio)
  const rawWidth = Math.max(Math.round(width * rawPixelRatio), 1)
  const rawHeight = Math.max(Math.round(height * rawPixelRatio), 1)
  const maxRenderPixels = Math.max(settings.maxRenderPixels, 1)
  const rawPixels = rawWidth * rawHeight

  if (rawPixels <= maxRenderPixels) {
    return {
      height: rawHeight,
      pixelRatio: rawPixelRatio,
      width: rawWidth,
    }
  }

  const scale = Math.sqrt(maxRenderPixels / rawPixels)
  const pixelRatio = rawPixelRatio * scale

  return {
    height: Math.max(Math.round(rawHeight * scale), 1),
    pixelRatio,
    width: Math.max(Math.round(rawWidth * scale), 1),
  }
}
