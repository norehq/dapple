import { passThroughVertexShader } from './shaders'
import {
  FINAL_FRAGMENT_SHADERS,
  FULLSCREEN_VERTICES,
  IMAGE_TEXTURE_UNIT,
  PRESENTATION_FRAGMENT_SHADER,
  PRESENTATION_UNIFORM_KEYS,
  POSITION_ATTRIBUTE_LOCATION,
  PROGRAM_UNIFORM_KEYS,
} from '../configs'
import { createCanvasElement } from '../dom/elements'
import { requiredResource } from '../resources/required-resource'
import type { DappleMarkMode, DappleSettings } from '../types'

export type UniformLocation = WebGLUniformLocation | null | undefined

export type ProgramResources = {
  program: WebGLProgram
  uniforms: Record<string, UniformLocation>
}

export type SceneResources = {
  canvas: HTMLCanvasElement
  finalPrograms: Record<DappleMarkMode, ProgramResources>
  gl: WebGLRenderingContext
  imageTexture: WebGLTexture
  presentationFramebuffer: WebGLFramebuffer | null
  presentationMode: DappleSettings['presentationMode']
  presentationProgram: ProgramResources | null
  presentationTexture: WebGLTexture | null
  positionBuffer: WebGLBuffer
  powerPreference: DappleSettings['powerPreference']
  renderHeight: number
  renderWidth: number
}

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader => {
  const shader = requiredResource(gl.createShader(type), 'shader')

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? 'Unknown shader error.'

    gl.deleteShader(shader)
    throw new Error(info)
  }

  return shader
}

const createProgram = (
  gl: WebGLRenderingContext,
  fragmentShaderSource: string,
): WebGLProgram => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, passThroughVertexShader)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  const program = requiredResource(gl.createProgram(), 'program')

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.bindAttribLocation(program, POSITION_ATTRIBUTE_LOCATION, 'position')
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? 'Unknown program error.'

    gl.deleteProgram(program)
    throw new Error(info)
  }

  return program
}

const programUniforms = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
): Record<string, UniformLocation> =>
  Object.fromEntries(
    PROGRAM_UNIFORM_KEYS.map(key => [key, gl.getUniformLocation(program, key)]),
  )

const presentationUniforms = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
): Record<string, UniformLocation> =>
  Object.fromEntries(
    PRESENTATION_UNIFORM_KEYS.map(key => [key, gl.getUniformLocation(program, key)]),
  )

const createProgramResources = (
  gl: WebGLRenderingContext,
  fragmentShaderSource: string,
): ProgramResources => {
  const program = createProgram(gl, fragmentShaderSource)

  return {
    program,
    uniforms: programUniforms(gl, program),
  }
}

const createPresentationProgramResources = (
  gl: WebGLRenderingContext,
): ProgramResources => {
  const program = createProgram(gl, PRESENTATION_FRAGMENT_SHADER)

  return {
    program,
    uniforms: presentationUniforms(gl, program),
  }
}

const configureTexture = (gl: WebGLRenderingContext, texture: WebGLTexture) => {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
}

export const createSceneResources = (
  root: HTMLDivElement,
  powerPreference: DappleSettings['powerPreference'],
  presentationMode: DappleSettings['presentationMode'],
): SceneResources => {
  const canvas = createCanvasElement()
  const gl = requiredResource(
    canvas.getContext('webgl', {
      alpha: presentationMode === 'direct',
      antialias: false,
      premultipliedAlpha: false,
      powerPreference,
    }),
    'context',
  )
  const positionBuffer = requiredResource(gl.createBuffer(), 'buffer')
  const imageTexture = requiredResource(gl.createTexture(), 'texture')
  const presentationFramebuffer =
    presentationMode === 'composited'
      ? requiredResource(gl.createFramebuffer(), 'framebuffer')
      : null
  const presentationTexture =
    presentationMode === 'composited'
      ? requiredResource(gl.createTexture(), 'texture')
      : null
  const finalPrograms = {
    dots: createProgramResources(gl, FINAL_FRAGMENT_SHADERS.dots),
    hybrid: createProgramResources(gl, FINAL_FRAGMENT_SHADERS.hybrid),
    lines: createProgramResources(gl, FINAL_FRAGMENT_SHADERS.lines),
  }
  const presentationProgram =
    presentationMode === 'composited'
      ? createPresentationProgramResources(gl)
      : null

  root.appendChild(canvas)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_VERTICES, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(POSITION_ATTRIBUTE_LOCATION)
  gl.vertexAttribPointer(POSITION_ATTRIBUTE_LOCATION, 2, gl.FLOAT, false, 0, 0)
  gl.activeTexture(gl.TEXTURE0 + IMAGE_TEXTURE_UNIT)
  configureTexture(gl, imageTexture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

  if (presentationTexture) {
    configureTexture(gl, presentationTexture)
  }

  gl.clearColor(0, 0, 0, 0)

  return {
    canvas,
    finalPrograms,
    gl,
    imageTexture,
    presentationFramebuffer,
    presentationMode,
    presentationProgram,
    presentationTexture,
    positionBuffer,
    powerPreference,
    renderHeight: 1,
    renderWidth: 1,
  }
}

export const disposeSceneResources = (resources: SceneResources) => {
  resources.gl.deleteBuffer(resources.positionBuffer)
  resources.gl.deleteTexture(resources.imageTexture)
  if (resources.presentationFramebuffer) {
    resources.gl.deleteFramebuffer(resources.presentationFramebuffer)
  }

  if (resources.presentationTexture) {
    resources.gl.deleteTexture(resources.presentationTexture)
  }

  Object.values(resources.finalPrograms).forEach(programResources => {
    resources.gl.deleteProgram(programResources.program)
  })
  if (resources.presentationProgram) {
    resources.gl.deleteProgram(resources.presentationProgram.program)
  }

  resources.canvas.remove()
}

export const prepareDraw = (
  resources: SceneResources,
  programResources: ProgramResources,
) => {
  const { gl } = resources

  gl.useProgram(programResources.program)
  gl.bindBuffer(gl.ARRAY_BUFFER, resources.positionBuffer)
  gl.enableVertexAttribArray(POSITION_ATTRIBUTE_LOCATION)
  gl.vertexAttribPointer(POSITION_ATTRIBUTE_LOCATION, 2, gl.FLOAT, false, 0, 0)
}

export const setUniform1f = (
  gl: WebGLRenderingContext,
  location: UniformLocation,
  value: number,
) => {
  if (location) {
    gl.uniform1f(location, value)
  }
}

export const setUniform1i = (
  gl: WebGLRenderingContext,
  location: UniformLocation,
  value: number,
) => {
  if (location) {
    gl.uniform1i(location, value)
  }
}

export const setUniform2f = (
  gl: WebGLRenderingContext,
  location: UniformLocation,
  x: number,
  y: number,
) => {
  if (location) {
    gl.uniform2f(location, x, y)
  }
}

export const setUniform3f = (
  gl: WebGLRenderingContext,
  location: UniformLocation,
  x: number,
  y: number,
  z: number,
) => {
  if (location) {
    gl.uniform3f(location, x, y, z)
  }
}
