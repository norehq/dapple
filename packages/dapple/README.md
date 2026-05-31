# @norehq/dapple

A small WebGL renderer for dapple images with lines, dots, and hybrid mark
modes. The core API is framework agnostic and the React wrapper is available
from a separate subpath.

## Links

- GitHub: [github.com/norehq/dapple](https://github.com/norehq/dapple)
- Preview: [dapple.nore.sh](https://dapple.nore.sh)

## Install

```bash
pnpm add @norehq/dapple
```

React users can also install React peer dependencies as usual.

## Vanilla API

```ts
import { createDappleRenderer } from '@norehq/dapple'

const renderer = createDappleRenderer(container, {
  onError(error, event) {
    console.error(error, event.source)
  },
  onLoad(event) {
    console.info(event.imageWidth, event.imageHeight)
  },
  placeholder: {
    backgroundColor: '#000000',
    dashColor: '#696963',
  },
  settings: {
    backgroundColor: '#000000',
    dashColor: '#959595',
    dotGamma: 1,
    lineWidth: 0.45,
    markMode: 'lines',
    power: -0.1,
    tileSize: 10,
    toneTarget: 'light',
    zoom: 1.25,
  },
})

// The placeholder is visible immediately. Image resources load later.
await renderer.load({ imageUrl: '/hero.webp' })

renderer.update({
  tileSize: 16,
})

renderer.dispose()
```

## Core Interfaces

`createDappleRenderer(container, options)` creates and mounts a renderer inside
the given element. It returns a `DappleRenderer`.

`DappleRenderer` exposes these methods:

- `load(source)`: asynchronously load an `imageUrl` or existing
  `HTMLImageElement`, upload it to WebGL, and render it.
- `update(settings)`: merge partial settings into the current renderer settings.
- `renderPlaceholder(placeholder)`: show or restyle the lightweight placeholder;
  pass `false` to hide it.
- `clear()`: cancel the current load sequence and clear the current image.
- `resize()`: recompute the render size from the container.
- `start()` / `stop()`: control continuous rendering.
- `dispose()`: remove observers, WebGL resources, and mounted DOM.

`DappleSource` accepts either `imageUrl` or `imageElement`. `crossOrigin` is
forwarded to the created image element when loading by URL.

`DappleRendererOptions` accepts `settings`, `placeholder`, `source`, and
lifecycle callbacks:

- `onError(error, event)`: receives normalized load/render setup errors. The
  event includes `source` when the error is tied to a load request.
- `onLoadStart(event)`: fires when a new `load(...)` request begins.
- `onLoad(event)`: fires after the image is decoded, uploaded, and initially
  rendered. Includes image and render dimensions.
- `onRender(event)`: fires after each render pass. In `continuous` mode this can
  be frequent.
- `onResize(event)`: fires when render dimensions actually change. Includes CSS
  size, pixel ratio, render size, and total render pixels.
- `onResourcesReady(event)`: fires when WebGL resources are created. Useful for
  telemetry or UI state that depends on renderer readiness.

## React API

```tsx
import { DappleCanvas } from '@norehq/dapple/react'

export function Preview() {
  return (
    <DappleCanvas
      source={{ imageUrl: '/hero.webp' }}
      placeholder={{ backgroundColor: '#000000' }}
      onError={error => console.error(error)}
      onReady={() => console.info('first image rendered')}
      settings={{ markMode: 'lines', tileSize: 10, dashColor: '#959595' }}
    />
  )
}
```

`DappleCanvas` forwards the core callbacks (`onError`, `onLoadStart`, `onLoad`,
`onRender`, `onResize`, `onResourcesReady`) and also keeps `onReady` as a small
React convenience callback after successful image load/render.

## Field

`@norehq/dapple/field` exports a standalone dot-field generator for loading
surfaces, empty states, or preview backdrops. It is separate from the WebGL
renderer, so applications can opt in without coupling it to image rendering.

```ts
import { createDappleFieldStyle } from '@norehq/dapple/field'

const style = createDappleFieldStyle({
  backgroundColor: '#050505',
  color: '#696963',
  jitter: 0.54,
  seed: 'preview',
  size: 8,
})
```

React apps can use the optional wrapper from `@norehq/dapple/react-field`:

```tsx
import { DappleField } from '@norehq/dapple/react-field'

export function LoadingField() {
  return <DappleField jitter={0.54} seed="preview" />
}
```

## Mark Modes

`markMode` selects one of three rendering styles:

- `lines`: horizontal scanline marks from the source image.
- `dots`: circular dapple marks sampled from the source image.
- `hybrid`: dot marks blended with horizontal line detail.

The line layer uses one short horizontal segment per cell. `lineWidth` controls
segment thickness, `lineStrength` controls opacity, and `lineSoftness` controls
edge falloff.

Dot settings are available in dot and hybrid modes. Use `dotScale` for maximum
dot radius, `dotGamma` for tone response, `dotMinRadius` for preserving tiny
marks, `dotSoftness` for edge antialiasing, and `dotSampleMode: 'multi'` to
reduce missed fine details.

Shared controls apply across modes. Use `tileSize` for grid density, `power` to
shift the tone response, `toneTarget: 'light'` for light marks on a dark
background, or `toneTarget: 'dark'` for dark marks on a light background.

The renderer uses weighted luminance rather than a plain RGB average. Use
`highlightRolloff` to protect bright areas from becoming flat white blocks, and
`shadowBoost` to retain a little more low-end tone before marks are generated.

## Async Loading

`createDappleRenderer` mounts a lightweight placeholder first. Call
`renderer.load(...)` when your image URL, Blob URL, or `HTMLImageElement` is
ready. This lets applications reserve layout space and avoid blocking the first
paint on image decoding or WebGL resources.

## License

MIT
