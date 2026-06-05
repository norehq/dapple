# @unix/dapple

A small WebGL renderer for dapple images with lines, dots, and hybrid mark
modes. The core API is framework agnostic and the React wrapper is available
from a separate subpath.

## Links

- GitHub: [github.com/unix/dapple](https://github.com/unix/dapple)
- Preview: [dapple.witt.im](https://dapple.witt.im)

## Install

```bash
pnpm add @unix/dapple
```

React users can also install React peer dependencies as usual.

## Vanilla API

```ts
import { createDappleRenderer } from '@unix/dapple'

const renderer = createDappleRenderer(container, {
  onError: error => console.error(error),
  settings: {
    backgroundColor: '#000000',
    dashColor: '#959595',
    markMode: 'lines',
    tileSize: 10,
  },
})

await renderer.load({ imageUrl: '/hero.webp' })
renderer.update({ markMode: 'dots', tileSize: 14 })
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
import { DappleCanvas } from '@unix/dapple/react'

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

`@unix/dapple/field` exports a standalone dot-field generator for loading
surfaces, empty states, or preview backdrops. It is separate from the WebGL
renderer, so applications can opt in without coupling it to image rendering.

```ts
import { createDappleFieldStyle } from '@unix/dapple/field'

const style = createDappleFieldStyle({
  backgroundColor: '#050505',
  color: '#696963',
  jitter: 0.54,
  seed: 'preview',
  size: 8,
})
```

React apps can use the optional wrapper from `@unix/dapple/react-field`:

```tsx
import { DappleField } from '@unix/dapple/react-field'

export function LoadingField() {
  return <DappleField jitter={0.54} seed="preview" />
}
```

## Mark Modes

`markMode` selects one of three rendering styles:

- `lines`: horizontal scanline marks.
- `dots`: circular dapple marks.
- `hybrid`: dots with horizontal line detail.

Common controls include `tileSize` for grid density, `power` for tone response,
`toneTarget` for light-on-dark or dark-on-light output, and `dashColor` /
`backgroundColor` for the palette. Line modes use `lineWidth`, `lineStrength`,
and `lineSoftness`; dot modes use `dotScale`, `dotGamma`, `dotMinRadius`,
`dotSoftness`, and `dotSampleMode`.

The renderer uses weighted luminance rather than a plain RGB average. Use
`highlightRolloff` to protect bright areas from becoming flat white blocks, and
`shadowBoost` to retain a little more low-end tone before marks are generated.

## Presentation

`presentationMode` controls how the final WebGL image is presented:

- `direct`: render the effect directly into the visible canvas. This is the
  default and has the least GPU work.
- `composited`: render the effect into an offscreen target, then run a small
  presentation pass into an opaque visible canvas.

Use `composited` when the canvas is placed in a constrained compositor, such as
mobile browsers, embedded WebViews, transformed or scrolling containers, or
screens where transparent WebGL output appears blank even though exports are
valid. It costs an extra fullscreen pass plus one render-sized texture, so keep
`direct` for normal desktop pages unless you need the more stable presentation
path.

A common setup is to default mobile devices to `composited`:

```ts
import { createDappleRenderer } from '@unix/dapple'

const isMobile =
  /Android|iPad|iPhone|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 &&
    window.matchMedia('(max-width: 980px)').matches)

const renderer = createDappleRenderer(container, {
  settings: {
    presentationMode: isMobile ? 'composited' : 'direct',
  },
})
```

## Async Loading

`createDappleRenderer` mounts a lightweight placeholder first. Call
`renderer.load(...)` when your image URL, Blob URL, or `HTMLImageElement` is
ready. This lets applications reserve layout space and avoid blocking the first
paint on image decoding or WebGL resources.

## License

MIT
