export type RgbColor = [number, number, number]

let colorContext: CanvasRenderingContext2D | null = null

const colorParserContext = (): CanvasRenderingContext2D | null => {
  if (colorContext) {
    return colorContext
  }

  colorContext = document.createElement('canvas').getContext('2d')

  return colorContext
}

const parseHexColor = (color: string): RgbColor | null => {
  const shortHexMatch = color.match(/^#([0-9a-f]{3})$/i)

  if (shortHexMatch?.[1]) {
    const value = shortHexMatch[1]

    return [...value].map(
      channel => parseInt(`${channel}${channel}`, 16) / 255,
    ) as RgbColor
  }

  const hexMatch = color.match(/^#([0-9a-f]{6})$/i)

  if (!hexMatch) {
    return null
  }

  const value = hexMatch[1]

  if (!value) {
    return null
  }

  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ]
}

const parseRgbColor = (color: string): RgbColor | null => {
  const match = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)

  if (!match) {
    return null
  }

  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255]
}

export const parseColor = (color: string): RgbColor => {
  const directColor = parseHexColor(color) ?? parseRgbColor(color)

  if (directColor) {
    return directColor
  }

  const context = colorParserContext()

  if (!context) {
    return [1, 1, 1]
  }

  context.fillStyle = '#ffffff'
  context.fillStyle = color

  return (
    parseHexColor(context.fillStyle) ?? parseRgbColor(context.fillStyle) ?? [1, 1, 1]
  )
}
