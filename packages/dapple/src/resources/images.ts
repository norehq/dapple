import { requiredResource } from './required-resource'
import type { DappleSource } from '../types'

export type TextureSource = {
  downscaled: boolean
  height: number
  source: HTMLCanvasElement | HTMLImageElement
  width: number
}

export const loadImage = (source: DappleSource): Promise<HTMLImageElement> => {
  if (source.imageElement) {
    return Promise.resolve(source.imageElement)
  }

  if (!source.imageUrl) {
    return Promise.reject(new Error('Dapple source requires imageUrl.'))
  }

  const imageUrl = source.imageUrl

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    if (source.crossOrigin !== undefined) {
      image.crossOrigin = source.crossOrigin
    }

    image.decoding = 'async'
    image.onload = (): void => resolve(image)
    image.onerror = (): void =>
      reject(new Error(`Dapple image failed to load: ${imageUrl}`))
    image.src = imageUrl
  })
}

export const createTextureSource = (
  image: HTMLImageElement,
  renderWidth: number,
  renderHeight: number,
): TextureSource => {
  const sourcePixels = image.width * image.height
  const targetPixels = Math.max(renderWidth * renderHeight * 1.5, 1)

  if (sourcePixels <= targetPixels) {
    return {
      downscaled: false,
      height: image.height,
      source: image,
      width: image.width,
    }
  }

  const scale = Math.sqrt(targetPixels / sourcePixels)
  const width = Math.max(Math.round(image.width * scale), 1)
  const height = Math.max(Math.round(image.height * scale), 1)
  const canvas = document.createElement('canvas')
  const context = requiredResource(canvas.getContext('2d'), '2d context')

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  return {
    downscaled: true,
    height,
    source: canvas,
    width,
  }
}
