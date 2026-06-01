import type { DapplePlaceholder, DappleSettings } from '../types'

export const applyRootStyles = (root: HTMLDivElement, settings: DappleSettings) => {
  root.style.background = settings.transparent
    ? 'transparent'
    : settings.backgroundColor
}

export const applyPlaceholderStyles = (
  element: HTMLDivElement,
  placeholder: Required<DapplePlaceholder>,
) => {
  const size = Math.max(placeholder.size, 1)
  const dotSize = Math.max(Math.round(size * 0.34), 1)

  element.style.backgroundColor = placeholder.backgroundColor
  element.style.backgroundImage = `radial-gradient(
    circle,
    ${placeholder.dashColor} 0 ${dotSize}px,
    transparent ${dotSize + 1}px
  )`
  element.style.backgroundPosition = `${size / 2}px ${size / 2}px`
  element.style.backgroundSize = `${size}px ${size}px`
  element.style.opacity = String(placeholder.opacity)
}

export const createRootElement = (settings: DappleSettings): HTMLDivElement => {
  const root = document.createElement('div')

  root.style.height = '100%'
  root.style.minHeight = '0'
  root.style.overflow = 'hidden'
  root.style.position = 'relative'
  root.style.width = '100%'
  applyRootStyles(root, settings)

  return root
}

export const createPlaceholderElement = (
  placeholder: Required<DapplePlaceholder>,
): HTMLDivElement => {
  const element = document.createElement('div')

  element.style.inset = '0'
  element.style.position = 'absolute'
  element.style.transition = 'opacity 180ms ease'
  element.style.zIndex = '1'
  element.dataset.opacityValue = String(placeholder.opacity)

  return element
}

export const createCanvasElement = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')

  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.display = 'block'
  canvas.style.height = '100%'
  canvas.style.inset = '0'
  canvas.style.position = 'absolute'
  canvas.style.width = '100%'
  canvas.style.zIndex = '0'

  return canvas
}

export const setElementVisible = (element: HTMLElement, visible: boolean) => {
  element.style.opacity = visible ? element.dataset.opacityValue || '1' : '0'
}
