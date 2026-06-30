# Digital Mining Twin

A premium, interactive **mining Digital Twin** built with **React Three Fiber + Three.js + TailwindCSS**, with live (simulated) telemetry, glassmorphism HMI status cards, a control-room telemetry layer, colour-coded material flow, and click-through asset analytics.

> Full process flow, end-to-end:
> **Exploration → Drilling → Blast Bench → Hydraulic Shovel → Haul Trucks → Crusher → Screen → SAG Mill → Hydrocyclone → Flotation → Thickener → Filter Press → Radial Stacker → Rail Loadout → Ship Loader → Bulk Carrier → Smelter.**

## Features
- **Procedural animated equipment** — every machine continuously performs its operation (spinning mill, vibrating screen, flotation agitators + froth, thickener rake, filter-press cycle, slewing stacker, ship-loader stream, truck wheels + dust, ore spilling from the shovel bucket, smelter stacks + furnace glow).
- **Digital-twin layer** — a floating glassmorphism HMI status card on every asset (status / health / live metrics), animated dashed **telemetry lines** with travelling data pulses converging on the Mine Control Room, and colour-coded **material-flow particles** (ore / concentrate / water / tailings).
- **Operations HUD** — KPI top bar (production, fleet utilization, throughput, recovery, power, alerts), fleet status summary, site weather, and a flow legend.
- **Interactive** — hover to highlight, click any asset for a side panel with a live **Highcharts** trend, health, all live values and connected sensors.
- **Live simulated telemetry** — a 1 Hz engine walks every metric within range, evolves states, and feeds the cards, KPIs and charts.

## Stack
React 18 · Vite · React Three Fiber · Three.js · @react-three/drei · @react-three/postprocessing · Zustand · Framer Motion · Highcharts · TailwindCSS · Leva · React Icons.

## Run locally
```bash
npm install
npm run dev        # open the printed localhost URL
npm run build      # production build → dist/
npm run preview    # preview the build
```

## Project structure
```
index.html
src/
  main.jsx                      mounts the app
  MiningDigitalTwin.jsx         page shell (3D stage + HUD + side panel + telemetry clock)
  styles.css                    Tailwind layers + glassmorphism tokens
  scene/                        Stage, PostFX, Terrain, ControlRoom
  components/digitalTwin/
    Mine/ Processing/ Logistics/  procedural animated equipment
    Assets/                       shared primitives + PBR material palette
    TwinUI/                       HMI cards, HUD, telemetry lines, material flow, side panel
    registry.js                   asset type → component map
  data/
    assets.config.js            assets, positions, metrics (nominal/min/max)
    telemetryStore.js           Zustand store + 1 Hz simulation engine
```

All telemetry is **simulated** for the demo; each metric is shaped to bind to a real UNS / OPC-UA tag later.
