# B-Line X Dynamics — Career Transit Map

An interactive 3D career paths explorer built with Vue 3 and Three.js. Career
tracks at a fictional asteroid-mining / deep-space-exploration company are
rendered as a metro transit map: three lines climb from entry-level stations
up to the executive terminals, and interchange stations let employees
transfer between tracks.

## Tracks

- **Engineering Line (ENG)** — spacecraft, propulsion, and orbital mining systems
- **Sciences Line (SCI)** — astrogeology, prospecting, and deep space research
- **Medical Line (MED)** — crew health, space medicine, and bioastronautics

Interchange stations (white rings) sit on two lines at once:

- *Mission Operations Specialist* (L3) — Engineering ↔ Sciences
- *Bioastronautics Lead* (L5) — Sciences ↔ Medical
- *Crew Systems Director* (L6) — Engineering ↔ Medical

## Running

```bash
npm install
npm run dev
```

## Controls

- **Drag** to orbit, **scroll** to zoom, **right-drag** to pan
- **Click a station** for position details (grade, compensation, requirements, next stops)
- **Click a line** in the legend to isolate that track
- **Reset view** returns to the full map

## Stack

- Vue 3 (Composition API) + Vite
- Three.js — tube-geometry metro lines, CSS2D station labels, UnrealBloom
  postprocessing, animated "trains" gliding along each line
- Career data is mock data in `src/data/careers.js`; the scene is built
  entirely from it, so edits there reshape the map automatically
