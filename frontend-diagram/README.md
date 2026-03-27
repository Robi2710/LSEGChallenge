# Frontend Diagram (SVG-Only Renderer)

This frontend is the Owner C rendering workspace for the diagram generator app. It is currently scoped to **SVG-only** output.

## What is implemented

- SVG input editor (paste model output)
- SVG validation (`<svg ...></svg>` required)
- Render states: empty, rendering, success, error
- Preview panel for rendered SVG
- Utility actions: copy SVG and download `.svg`

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Integration contract (Owner C ↔ Owner B)

`SvgRenderer` expects a raw SVG string. Upstream parser should return:

- `type`: `svg`
- `code`: complete SVG markup string

If code is not a full SVG element, renderer shows an error state.
