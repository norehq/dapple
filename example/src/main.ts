import { createDappleRenderer, type DappleMarkMode } from '@unix/dapple'

import personImageUrl from './person-01.jpg'
import './style.css'

const container = document.querySelector<HTMLDivElement>('#dapple-root')
const modeLabel = document.querySelector<HTMLSpanElement>('#mode-label')
const modeButton = document.querySelector<HTMLButtonElement>('#mode-button')

if (!container || !modeButton || !modeLabel) {
  throw new Error('Example markup is missing required elements.')
}

const modes: DappleMarkMode[] = ['lines', 'dots', 'hybrid']
let modeIndex = 0

const currentMode = (): DappleMarkMode => modes[modeIndex] ?? 'lines'

const renderer = createDappleRenderer(container, {
  placeholder: {
    backgroundColor: '#101014',
    dashColor: '#7f8b80',
  },
  settings: {
    backgroundColor: '#000000',
    dashColor: '#d7d3ca',
    dotGamma: 0.92,
    dotSampleMode: 'multi',
    dotScale: 0.9,
    lineStrength: 0.86,
    lineWidth: 0.44,
    markMode: currentMode(),
    power: -0.08,
    tileSize: 8,
    toneTarget: 'light',
    zoom: 1.04,
  },
  onError(error) {
    console.error(error)
  },
})

await renderer.load({ imageUrl: personImageUrl })

modeButton.addEventListener('click', () => {
  modeIndex = (modeIndex + 1) % modes.length
  const markMode = currentMode()

  renderer.update({ markMode })
  modeLabel.textContent = markMode
})
