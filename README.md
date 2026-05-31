<p align="center">
  <img
    alt="Dapple preview banner"
    src="packages/preview/public/banner.png"
    width="700"
  />
</p>

<h1 align="center">DAPPLE</h1>

<h3 align="center">
  Transform images into crisp, expressive dot-and-scanline artwork.
</h3>
<br/><br/><br/><br/>
Dapple is a small WebGL renderer for turning images into graphic dot, scanline,
and hybrid mark treatments. It is built for product previews, editorial
surfaces, loading states, and interfaces that need a distinctive image texture
without handing layout control to a heavy graphics stack. Preview it at
[dapple.nore.sh](https://dapple.nore.sh).

## Highlights

- Framework-agnostic WebGL renderer with optional React entry points.
- Line, dot, and hybrid rendering modes with tone, density, and softness
  controls.
- Lightweight placeholder and dot-field utilities for loading states and empty
  surfaces.

## What Is Included

- `@norehq/dapple`: the framework-agnostic renderer, plus optional React
  wrappers.
- `@norehq/dapple-preview`: a Vite preview app for tuning settings and testing
  image sources.
- Shared TypeScript, Vite, and Prettier configuration for the workspace.

## Getting Started

Use the package in an app:

```bash
pnpm add @norehq/dapple
```

For API examples and renderer options, see
[`packages/dapple/README.md`](packages/dapple/README.md).

## License

MIT
