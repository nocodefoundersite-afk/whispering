# Whispering Wood — R02 reference-based 3D study

R02 rebuilds the first simplified model following the user's uploaded references. It is an image-based architectural concept, not a measured reconstruction or a construction package.

## Reference hierarchy

1. The surveyed plan superimposed on the master plan, dated 10 October 2025: irregular main parcel west of the access road; parking and nursery on the northern eastern extension; reception at the eastern edge; clubhouse below the main pool; accommodation to the west and north; detached staff/utility court to the south.
2. `00(1).png`: steep grey pitched and A-frame forms, glass and timber, white/stone walls, several pools, planted islands, basalt retaining walls, terraced lawns and curved stone paths.
3. The KLS proposal image: restaurant, gym, spa, coworking, shared amenities, amphitheatre and children's garden programme.
4. The August landscape master plan: extended adventure and landscape functions. Its different orientation and layout are not superimposed as if identical to the surveyed plan.
5. The two clear-site-plan PNGs are supporting visual explanations, not independent surveys.

These sources depict different versions. Their design language and programme are reconciled in R02; exact matches in position, scale and level are not claimed.

## Revisions

- Irregular site massing replaces the rectangular model base.
- Three concept terraces at +0.50, +2.60 and +4.80 m, with curved retaining walls, broad stairs and planted borders. These levels are design assumptions, not surveyed elevations.
- Grey gabled, hipped and pyramidal roofs; four steep-roofed Bali pavilions; three roof sections at the restaurant.
- Freeform main pool with planted island, two raised spa basins, a rectangular lap pool and an elevated Bali pool. Hollow coping rings keep the water visible. Turquoise depth colour, lighter edges and restrained ripple highlights replace the washed-out water.
- Eight studio units in staggered upper clusters, four Bali pavilions, four lower garden cottages and a separate western courtyard accommodation block. Counts are provisional interpretations.
- Curved guest circulation, an outer western service lane and an eastern vehicle road with arrival court. Nursery, shed, northern parking, adventure routes and detached staff/utility court are represented.
- Layered shrubs, hedges, palms, border planting and lawn terraces.
- Three viewing modes: 3D core view, top view and whole-site view. Selection, orbit, zoom, floor cutaways, room schedules, isolation, labels, planting switch and PNG export are retained.
- Rotated/elevated buildings use transformed camera targets, room labels and selection outlines.

## Area reconciliation

| Space | R02 working area | Basis |
|---|---:|---|
| Restaurant footprint | 288 m² | KLS proposal; earlier brief 285 m² |
| Gym footprint | 187 m² | Brief and proposal |
| Spa footprint | 188 m² | Brief and proposal |
| Coworking / retail footprint | 185 m² | Brief and proposal |
| Core pool and plaza | 650 m² allocation | Combined programme, not water surface alone |
| Amphitheatre | 338 m² allocation | Brief and proposal |
| Children's garden | 227 m² | KLS proposal; earlier brief 237 m² |

The restaurant's preliminary room cells, openings and entries are rescaled from 15 × 19 m to 16 × 18 m. Other interiors retain the preliminary room studies. Additional lap/Bali pools are reference-led additions with provisional areas, outside the core 650 m² allocation. Support structures and parking are illustrative.

## Coordination still required

Native CAD survey, reliable dimensions, contours and spot levels are needed before exact boundary/position/elevation alignment. Roof geometry and rooms require architectural coordination; drainage, structures, services, access gradients, clearances, setbacks and statutory compliance are not resolved by this visual model. No capacity, engineering sizing or construction readiness is asserted.

## Rendering and validation

The viewer uses actual Three.js mesh geometry. A CPU depth-buffer renderer displays the same geometry when WebGL is unavailable, including vertex water colours and floor cutaways; cast shadows and physical reflections require WebGL. The review browser disables WebGL, so browser visual checks cover the CPU path. No GPU visual equivalence is claimed.

TypeScript checking passed. Restaurant ground, first and roof planning zones each total 288 m². A rotated-footprint intersection check found no overlapping building envelopes after the villa adjustment. Browser checks confirmed the restaurant ground/roof controls, URL floor restoration, rotated villa cutaways, isolation and full-site navigation. PNG download automation was not confirmed; the viewer retains its existing export implementation.

## Access

This portable build contains no application login. The Netlify site owner controls publication and any hosting access restrictions. The view link preserves the selected building and floor.
