# Whispering Wood — master-plan reconstruction R03

## Controlling source

The user-uploaded `MASTER PLAN WITH LANDSCAPE 25TH AUG_page-0001(2).jpg` (2048 × 1448) is the controlling plan for R03. `image(2).png` shows the same arrangement. The 10 October survey and earlier architectural aerial are **not** mixed into this revision. The earlier R02 arrangement is superseded.

A readable WebP copy of the source is bundled at `public/references/master-plan.webp`. Coordinates are traced in a 1888 × 1334 image space. Every footprint, path and reference-plane placement uses the same `world()` transform in `lib/map-data.ts`. Display scaling is 0.18 model units per image pixel, approximately consistent with the court annotations; it is not a surveyed scale.

## Image analysis and retained relationships

| Drawing region | Visible elements retained |
|---|---|
| Upper left | Four-wheeler parking, long outer row, central double row, short western row |
| Above the road, centre-left | Two distinct pavilion outlines, including their stepped edges |
| Upper centre-right | Paintball field, surrounding ATV circuit and serpentine eastern turn |
| Within the sports circuit | Yoga, sauna, changing blocks, gym, equipment room, garden axis, arrival lounge, extra space, one padel court and two pickleball courts |
| Far right | Long activity/dining block and separate annex; small unreadable room names remain unconfirmed |
| Main east–west road | Original kink and eastern curve; landscape edges retained |
| Day Club arrival | Semicircular vehicle court, planted island, small reception and western waiting/kiosk pavilion |
| Upper Day Club loop | Club house and restaurant at upper right, stepped kitchen/service group, two SPA rooms, open kitchen apron |
| Main pool area | Freeform pool, internal round features, curved bridge/counter, poolside furniture, four yellow tensile canopies on the left |
| Lower pool area | Long pool with notched accommodation bays, four detached pool villas, five western/northern poolside suite volumes |
| Radial cluster | Angular courtyard pool, eight visible wing outlines; wing count is not claimed as a confirmed room count |
| Garden enclave | Three pavilion footprints, branching orange paths, sculpted lawn, small circular basins, southern paved terrace |
| Lower accommodation | Paired room block with central passage; three separate paired studio footprints below it |

The broad curves, individual footprints and relative positions are reconstructed from the visible raster. Tiny furniture marks, doors, sanitary details, plant symbols and faint service annotations cannot all be resolved at survey accuracy from this image. Internal furniture and some partitions remain indicative. The model does not claim line-by-line CAD equivalence.

## Elevation and material assumptions

- No terrain levels or building elevations are supplied on this sheet. All plan surfaces use one ground datum; small raised surface offsets only prevent rendering conflicts.
- Building heights of roughly 3–4.2 display metres, low roof forms, glazing, columns and finishes are illustrative. Floor counts from older programme versions do not override this map.
- Yellow canopies, aqua pools, grey road/paving, green gardens, blue/green sports courts and warm garden paths reproduce the visible palette as materials. CAD magenta/cyan annotation strokes are not assumed to be exterior paint colours.
- These are presentation meshes, not engineered foundations, pool shells, retaining walls or a construction/BIM issue.

## Viewer and verification

- **3D model:** complete map arrangement, orbit, zoom, building selection and roof removal.
- **Plan check:** orthographic projection over the source image using the same image coordinates; site fills and planting hide so the drawing remains visible.
- **Original 2D:** source sheet alone in the same scene coordinates.
- **Walkthrough:** guided camera route along the Day Club paths. Dragging stops movement; Stop tour returns to the overview.
- **PNG export:** current view with a revision / assumption caption.
- **GLB export:** the actual 3D geometry, textures and materials, with the reference sheet and selection outline excluded.
- View URLs retain building, cutaway and comparison mode.

`node --experimental-strip-types scripts/check-trace.mjs` checks coordinate round trips, unique IDs, outline self-intersections and meaningful building/building or building/pool intersections. The production command is `npm run build`.

WebGL uses physical materials, texture maps, environment illumination and cast shadows. A CPU fallback retains geometry, camera navigation, perspective-correct texture mapping and projected soft shadows; physical reflections require WebGL. Browser QA in this environment uses that fallback because WebGL is disabled.
