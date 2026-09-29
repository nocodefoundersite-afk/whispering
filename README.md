# Whispering Wood — Interactive 3D Resort

R02 is a reference-based architectural concept for the Day Club and surrounding resort. Rotate and zoom the model, select buildings, reveal floors, inspect room schedules, switch to top/whole-site view, hide planting, isolate buildings and download views.

## Deploy on Netlify

1. Import this GitHub repository into Netlify.
2. Netlify reads `netlify.toml` automatically: **build command `npm run build`**, **publish directory `dist`**, **Node 22**.
3. Deploy. No environment variables, database, API key or paid 3D service is required.

This is a static React + Vite + Three.js application. Hosting access controls are your choice. It does not depend on ChatGPT sign-in or Cloudflare Workers.

## Run locally

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

## Design basis

See [docs/model-basis.md](docs/model-basis.md) for source priorities, changed areas and model limitations. Restaurant: **288 m²**; kids' garden: **227 m²**, following the KLS proposal. Positions and levels remain image-based concept assumptions pending CAD survey coordination.

The uploaded architectural and survey reference images are included for design review. The model uses WebGL where available and a software fallback otherwise. The software mode omits physical reflections and shadows.

## Source map

- `app/page.tsx`: viewer interface and controls
- `lib/project.ts`: programme, building locations and area schedule
- `lib/design-data.json`: preliminary room plans
- `lib/scene.ts`: 3D buildings, cutaways, selection and camera
- `lib/site-landscape.ts`: terrain, pools, roofs, paths, plants and amenities
- `lib/software-renderer.ts`: no-WebGL fallback
