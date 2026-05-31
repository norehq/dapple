export type DappleFieldOptions = {
  backgroundColor?: string
  cells?: number
  color?: string
  jitter?: number
  rows?: number
  seed?: number | string
  size?: number
}

export type DappleFieldStyle = {
  backgroundColor: string
  backgroundImage: string
  backgroundPosition: string
  backgroundRepeat: string
  backgroundSize: string
}

const DEFAULT_FIELD_OPTIONS = {
  backgroundColor: '#050505',
  cells: 76,
  color: '#696963',
  jitter: 0.16,
  rows: 48,
  seed: 'dapple-field',
  size: 6,
} satisfies Required<DappleFieldOptions>

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const escapeAttribute = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const formatNumber = (value: number): string => String(Number(value.toFixed(3)))

const smooth = (value: number): number => value * value * (3 - 2 * value)

const hashSeed = (seed: number | string): number => {
  const seedText = String(seed)
  let hash = 2_166_136_261

  for (let index = 0; index < seedText.length; index += 1) {
    hash = Math.imul(hash ^ seedText.charCodeAt(index), 16_777_619)
  }

  return hash >>> 0
}

const seededRandom = (seed: number | string): (() => number) => {
  let value = hashSeed(seed)

  return () => {
    value += 0x6d2b79f5

    let next = value
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)

    return ((next ^ (next >>> 14)) >>> 0) / 4_294_967_296
  }
}

const mergedOptions = (
  options: DappleFieldOptions = {},
): Required<DappleFieldOptions> => ({
  backgroundColor: options.backgroundColor ?? DEFAULT_FIELD_OPTIONS.backgroundColor,
  cells: options.cells ?? DEFAULT_FIELD_OPTIONS.cells,
  color: options.color ?? DEFAULT_FIELD_OPTIONS.color,
  jitter: options.jitter ?? DEFAULT_FIELD_OPTIONS.jitter,
  rows: options.rows ?? options.cells ?? DEFAULT_FIELD_OPTIONS.rows,
  seed: options.seed ?? DEFAULT_FIELD_OPTIONS.seed,
  size: options.size ?? DEFAULT_FIELD_OPTIONS.size,
})

const edgeProgressAt = (progress: number): number => {
  const centerProgress = 1 - Math.abs(progress * 2 - 1)

  return 1 - smooth(centerProgress)
}

const fieldProgressAt = (xProgress: number, yProgress: number): number => {
  const x = xProgress * 2 - 1
  const y = yProgress * 2 - 1
  const distance = Math.sqrt(x * x + y * y)
  const centerProgress = clamp(1 - distance, 0, 1)

  return smooth(centerProgress)
}

const createAxisPositions = (count: number, patternSize: number): number[] => {
  const edgeInset = patternSize / Math.max(count, 1) / 2

  if (count <= 1) {
    return [patternSize / 2]
  }

  const halfStep = edgeInset * 0.62

  if (count === 2) {
    return [halfStep, patternSize - halfStep]
  }

  const intervalWeights = Array.from({ length: count - 1 }, (_, index) => {
    const progress = (index + 0.5) / (count - 1)

    return 1 - edgeProgressAt(progress) * 0.58
  })
  const totalWeight = intervalWeights.reduce((total, weight) => total + weight, 0)
  const availableWidth = patternSize - halfStep * 2
  const positions = [halfStep]
  let position = halfStep

  for (const weight of intervalWeights) {
    position += (weight / totalWeight) * availableWidth
    positions.push(position)
  }

  return positions
}

const progressAt = (index: number, count: number): number =>
  count <= 1 ? 0.5 : index / (count - 1)

const createDotMark = (
  x: number,
  y: number,
  xProgress: number,
  yProgress: number,
  cellSize: number,
  jitter: number,
  random: () => number,
): string => {
  const radiusProgress = fieldProgressAt(xProgress, yProgress)
  const minRadius = Math.max(cellSize * 0.055, 0.32)
  const maxRadius = Math.max(cellSize * 0.129, minRadius)
  const radius = minRadius + (maxRadius - minRadius) * radiusProgress
  const offsetRange = cellSize * clamp(jitter, 0, 1) * 0.08
  const cx = x + (random() * 2 - 1) * offsetRange
  const cy = y + (random() * 2 - 1) * offsetRange

  return `<circle cx="${formatNumber(cx)}" cy="${formatNumber(cy)}" r="${formatNumber(radius)}"/>`
}

const createMarks = (
  columnCount: number,
  rowCount: number,
  width: number,
  height: number,
  cellSize: number,
  jitter: number,
  random: () => number,
): string[] => {
  const columnPositions = createAxisPositions(columnCount, width)
  const rowPositions = createAxisPositions(rowCount, height)
  const marks: string[] = []

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const x = columnPositions[column] ?? width / 2
      const y = rowPositions[row] ?? height / 2
      const xProgress = progressAt(column, columnCount)
      const yProgress = progressAt(row, rowCount)

      marks.push(createDotMark(x, y, xProgress, yProgress, cellSize, jitter, random))
    }
  }

  return marks
}

export const createDappleFieldDataUrl = (
  options: DappleFieldOptions = {},
): string => {
  const field = mergedOptions(options)
  const cellSize = Math.max(field.size, 1)
  const columnCount = Math.max(Math.round(field.cells), 1)
  const rowCount = Math.max(Math.round(field.rows), 1)
  const patternWidth = cellSize * columnCount
  const patternHeight = cellSize * rowCount
  const random = seededRandom(field.seed)
  const marks = createMarks(
    columnCount,
    rowCount,
    patternWidth,
    patternHeight,
    cellSize,
    field.jitter,
    random,
  )

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${formatNumber(patternWidth)}" height="${formatNumber(patternHeight)}" viewBox="0 0 ${formatNumber(patternWidth)} ${formatNumber(patternHeight)}">`,
    `<g fill="${escapeAttribute(field.color)}">`,
    marks.join(''),
    '</g>',
    '</svg>',
  ].join('')

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const createDappleFieldStyle = (
  options: DappleFieldOptions = {},
): DappleFieldStyle => {
  const field = mergedOptions(options)

  return {
    backgroundColor: field.backgroundColor,
    backgroundImage: `url("${createDappleFieldDataUrl(field)}")`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  }
}
