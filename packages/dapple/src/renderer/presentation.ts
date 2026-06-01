import { PRESENTATION_TEXTURE_UNIT } from '../configs'
import { parseColor } from '../dom/colors'
import type { DappleSettings, DappleSnapshotOptions } from '../types'
import {
  prepareDraw,
  setUniform1i,
  setUniform2f,
  setUniform3f,
  type SceneResources,
} from '../webgl/resources'

export const canvasBlob = (
  canvas: HTMLCanvasElement,
  options: DappleSnapshotOptions,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Unable to export image.'))
          return
        }

        resolve(blob)
      },
      options.type ?? 'image/png',
      options.quality,
    )
  })

export const resizePresentationTarget = (resources: SceneResources) => {
  const { gl, presentationFramebuffer, presentationTexture } = resources

  if (!presentationFramebuffer || !presentationTexture) {
    return
  }

  gl.bindTexture(gl.TEXTURE_2D, presentationTexture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    resources.renderWidth,
    resources.renderHeight,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  )
  gl.bindFramebuffer(gl.FRAMEBUFFER, presentationFramebuffer)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    presentationTexture,
    0,
  )

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('Presentation framebuffer is incomplete.')
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

export const renderPresentationScene = (
  resources: SceneResources,
  settings: DappleSettings,
) => {
  const { gl, presentationProgram, presentationTexture } = resources

  if (!presentationProgram || !presentationTexture) {
    return
  }

  prepareDraw(resources, presentationProgram)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, resources.renderWidth, resources.renderHeight)
  gl.activeTexture(gl.TEXTURE0 + PRESENTATION_TEXTURE_UNIT)
  gl.bindTexture(gl.TEXTURE_2D, presentationTexture)
  const backgroundColor = parseColor(settings.backgroundColor)

  setUniform3f(
    gl,
    presentationProgram.uniforms.presentationBackgroundColor,
    backgroundColor[0],
    backgroundColor[1],
    backgroundColor[2],
  )
  setUniform1i(gl, presentationProgram.uniforms.tScene, PRESENTATION_TEXTURE_UNIT)
  setUniform2f(
    gl,
    presentationProgram.uniforms.presentationSize,
    resources.renderWidth,
    resources.renderHeight,
  )
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

export const snapshotCanvas = (
  resources: SceneResources,
  framebuffer: WebGLFramebuffer | null,
): HTMLCanvasElement => {
  const { gl, renderHeight, renderWidth } = resources
  const pixels = new Uint8Array(renderWidth * renderHeight * 4)
  const rowLength = renderWidth * 4
  const imageData = new ImageData(renderWidth, renderHeight)
  const canvas = document.createElement('canvas')

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.finish()
  gl.readPixels(0, 0, renderWidth, renderHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  for (let y = 0; y < renderHeight; y += 1) {
    const sourceStart = (renderHeight - y - 1) * rowLength
    const targetStart = y * rowLength

    imageData.data.set(
      pixels.subarray(sourceStart, sourceStart + rowLength),
      targetStart,
    )
  }

  canvas.width = renderWidth
  canvas.height = renderHeight
  canvas.getContext('2d')?.putImageData(imageData, 0, 0)

  return canvas
}
