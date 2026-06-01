import { IMAGE_TEXTURE_UNIT } from '../configs'
import { parseColor } from '../dom/colors'
import { createTextureSource } from '../resources/images'
import type { DappleSettings } from '../types'
import {
  prepareDraw,
  setUniform1f,
  setUniform1i,
  setUniform2f,
  setUniform3f,
  type ProgramResources,
  type SceneResources,
} from '../webgl/resources'

export type TextureUploadResult = {
  logPayload: Record<string, unknown>
  textureKey: string
}

const forEachProgram = (
  resources: SceneResources,
  callback: (programResources: ProgramResources) => void,
) => {
  Object.values(resources.finalPrograms).forEach(callback)
}

export const clearScene = (resources: SceneResources) => {
  resources.gl.bindFramebuffer(resources.gl.FRAMEBUFFER, null)
  resources.gl.clear(resources.gl.COLOR_BUFFER_BIT)

  if (resources.presentationFramebuffer) {
    resources.gl.bindFramebuffer(
      resources.gl.FRAMEBUFFER,
      resources.presentationFramebuffer,
    )
    resources.gl.clear(resources.gl.COLOR_BUFFER_BIT)
    resources.gl.bindFramebuffer(resources.gl.FRAMEBUFFER, null)
  }
}

export const renderEffectScene = (
  resources: SceneResources,
  settings: DappleSettings,
  framebuffer: WebGLFramebuffer | null,
) => {
  const programResources = resources.finalPrograms[settings.markMode]

  prepareDraw(resources, programResources)
  resources.gl.bindFramebuffer(resources.gl.FRAMEBUFFER, framebuffer)
  resources.gl.viewport(0, 0, resources.renderWidth, resources.renderHeight)
  resources.gl.activeTexture(resources.gl.TEXTURE0 + IMAGE_TEXTURE_UNIT)
  resources.gl.bindTexture(resources.gl.TEXTURE_2D, resources.imageTexture)
  resources.gl.clear(resources.gl.COLOR_BUFFER_BIT)
  resources.gl.drawArrays(resources.gl.TRIANGLES, 0, 6)
}

export const syncImageSize = (
  resources: SceneResources,
  width: number,
  height: number,
) => {
  forEachProgram(resources, programResources => {
    const { gl } = resources

    gl.useProgram(programResources.program)
    setUniform2f(gl, programResources.uniforms.imageSize, width, height)
  })
}

export const syncSettingsUniforms = (
  resources: SceneResources,
  settings: DappleSettings,
) => {
  const dotColor = parseColor(settings.dashColor)

  forEachProgram(resources, programResources => {
    const { gl } = resources
    const { uniforms } = programResources

    gl.useProgram(programResources.program)
    setUniform1f(
      gl,
      uniforms.applyToDarkAreas,
      settings.toneTarget === 'dark' ? 1 : 0,
    )
    setUniform1f(gl, uniforms.contrast, settings.contrast)
    setUniform3f(gl, uniforms.dotColor, dotColor[0], dotColor[1], dotColor[2])
    setUniform1f(gl, uniforms.dotGamma, settings.dotGamma)
    setUniform1f(gl, uniforms.dotMinRadius, settings.dotMinRadius)
    setUniform1f(
      gl,
      uniforms.dotSampleMode,
      settings.dotSampleMode === 'multi' ? 1 : 0,
    )
    setUniform1f(gl, uniforms.dotScale, settings.dotScale)
    setUniform1f(gl, uniforms.dotSoftness, settings.dotSoftness)
    setUniform1f(gl, uniforms.highlightRolloff, settings.highlightRolloff)
    setUniform1f(gl, uniforms.imageFit, settings.fit === 'cover' ? 1 : 0)
    setUniform1f(gl, uniforms.lineSoftness, settings.lineSoftness)
    setUniform1f(gl, uniforms.lineStrength, settings.lineStrength)
    setUniform1f(gl, uniforms.lineWidth, settings.lineWidth)
    setUniform1f(gl, uniforms.power, settings.power)
    setUniform1f(gl, uniforms.shadowBoost, settings.shadowBoost)
    setUniform1f(gl, uniforms.tile, settings.tileSize)
    setUniform1f(gl, uniforms.zoom, settings.zoom)
    setUniform1i(gl, uniforms.tImage, IMAGE_TEXTURE_UNIT)
  })
}

export const syncViewportUniforms = (
  resources: SceneResources,
  cssWidth: number,
  cssHeight: number,
) => {
  forEachProgram(resources, programResources => {
    const { gl } = resources
    const { uniforms } = programResources

    gl.useProgram(programResources.program)
    setUniform2f(gl, uniforms.viewportSize, cssWidth, cssHeight)
    setUniform2f(
      gl,
      uniforms.effectResolution,
      resources.renderWidth,
      resources.renderHeight,
    )
  })
}

export const uploadImageTexture = (
  resources: SceneResources,
  image: HTMLImageElement,
  currentTextureKey: string,
): TextureUploadResult | null => {
  const nextTextureKey = [
    image.currentSrc || image.src,
    image.width,
    image.height,
    resources.renderWidth,
    resources.renderHeight,
  ].join(':')

  if (nextTextureKey === currentTextureKey) {
    return null
  }

  const textureSource = createTextureSource(
    image,
    resources.renderWidth,
    resources.renderHeight,
  )
  const { gl } = resources

  gl.activeTexture(gl.TEXTURE0 + IMAGE_TEXTURE_UNIT)
  gl.bindTexture(gl.TEXTURE_2D, resources.imageTexture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    textureSource.source,
  )
  syncImageSize(resources, textureSource.width, textureSource.height)

  return {
    logPayload: {
      downscaled: textureSource.downscaled,
      imageHeight: image.height,
      imageWidth: image.width,
      textureHeight: textureSource.height,
      textureWidth: textureSource.width,
    },
    textureKey: nextTextureKey,
  }
}
