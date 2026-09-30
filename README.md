# Whispering Wood — master plan in 3D

R03 reconstructs the uploaded **25 August landscape master plan**. It replaces the earlier mixed-reference site arrangement.

## Netlify

Import this GitHub repository, deploy branch `main`.

- Build command: `npm run build`
- Publish directory: `dist`
- Node: 22
- No environment variables or API keys required.

These settings and the single-page redirect are included in `netlify.toml`.

## Local development

```bash
npm ci
npm run dev
npm run build
npm run preview
```

## Review the layout

Use **Plan check** to see the reconstructed footprints over the original drawing; **Original 2D** shows the drawing alone. The viewer includes a guided walkthrough, roof removal, building selection, PNG view export and GLB model export.

The horizontal layout is traced from the source image. Building heights, roof profiles, finishes and unresolved internal details remain illustrative. This is not a measured CAD or construction model. See [the source analysis and assumptions](docs/model-basis.md).

## Source files

- `lib/map-data.ts`: source coordinates, footprint polygons, paths and source registration
- `lib/map-model.ts`: geometry, materials, furniture and planting
- `lib/scene.ts`: cameras, controls, walkthrough and exports
- `lib/software-renderer.ts`: textured CPU fallback for browsers without WebGL
- `app/page.tsx`: client review interface
- `public/references/master-plan.webp`: supplied controlling plan

Run the footprint audit with:

```bash
node --experimental-strip-types scripts/check-trace.mjs
```
