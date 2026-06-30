// Single source of truth for the mining digital twin: every asset, its position,
// telemetry metrics (with nominal/min/max for the simulator), and process role.
// Coordinates: X = process flow (left→right), Z = depth, Y up. 1 unit ≈ 1 m.

const m = (key, label, unit, min, max, nom) => ({ key, label, unit, min, max, nom })

export const GROUPS = ['Upstream', 'Processing', 'Downstream']

export const CONTROL_ROOM = { id: 'control', label: 'Mine Control Room', pos: [-2, 0, -26] }

export const ASSETS = [
  // ───────────────── UPSTREAM ─────────────────
  { id: 'exploration', type: 'Exploration', label: 'Exploration Rig', group: 'Upstream', tier: 'aux', pos: [-78, 0, 16], accent: '#9aa7b8',
    metrics: [m('depth', 'Hole Depth', 'm', 0, 1200, 250), m('coreRecovery', 'Core Recovery', '%', 80, 100, 96), m('penRate', 'Penetration', 'm/h', 0, 60, 22)] },
  { id: 'drill', type: 'DrillRig', label: 'Blasthole Drill', group: 'Upstream', tier: 'hero', pos: [-70, 0, 5], accent: '#f2b134',
    metrics: [m('penRate', 'Penetration', 'm/min', 0, 3, 0.9), m('holeDepth', 'Hole Depth', 'm', 0, 30, 18.5), m('rotaryRpm', 'Rotary Speed', 'rpm', 0, 200, 95), m('airPressure', 'Air Pressure', 'bar', 0, 12, 7.4)] },
  { id: 'blast', type: 'BlastBench', label: 'Blast Bench', group: 'Upstream', tier: 'aux', pos: [-62, 0, 13], accent: '#c08457',
    metrics: [m('holesCharged', 'Holes Charged', '', 0, 60, 24), m('powderFactor', 'Powder Factor', 'kg/m³', 0, 2, 0.74), m('volume', 'Blast Volume', 'm³', 0, 6000, 2800)] },
  { id: 'shovel', type: 'Shovel', label: 'Hydraulic Shovel', group: 'Upstream', tier: 'hero', pos: [-54, 0, -2], accent: '#f2b134',
    metrics: [m('payload', 'Bucket Payload', 't', 0, 60, 36), m('swingRate', 'Swing Rate', 'cyc/min', 0, 6, 3.4), m('enginePower', 'Engine Power', 'kW', 0, 2500, 1480), m('fuelRate', 'Fuel Rate', 'L/h', 0, 600, 295)] },
  { id: 'truck1', type: 'HaulTruck', label: 'Haul Truck A', group: 'Upstream', tier: 'hero', pos: [-49, 0, 3], accent: '#e7b53c', route: 0.0,
    metrics: [m('payload', 'Payload', 't', 0, 240, 220), m('speed', 'Ground Speed', 'km/h', 0, 60, 18), m('fuel', 'Fuel Level', '%', 0, 100, 71), m('engineTemp', 'Engine Temp', '°C', 60, 120, 92)] },
  { id: 'truck2', type: 'HaulTruck', label: 'Haul Truck B', group: 'Upstream', tier: 'hero', pos: [-43, 0, 7], accent: '#e7b53c', route: 0.28,
    metrics: [m('payload', 'Payload', 't', 0, 240, 228), m('speed', 'Ground Speed', 'km/h', 0, 60, 34), m('fuel', 'Fuel Level', '%', 0, 100, 58), m('engineTemp', 'Engine Temp', '°C', 60, 120, 95)] },
  { id: 'truck3', type: 'HaulTruck', label: 'Haul Truck C', group: 'Upstream', tier: 'aux', pos: [-37, 0, 2], accent: '#e7b53c', route: 0.55,
    metrics: [m('payload', 'Payload', 't', 0, 240, 0), m('speed', 'Ground Speed', 'km/h', 0, 60, 30), m('fuel', 'Fuel Level', '%', 0, 100, 44), m('engineTemp', 'Engine Temp', '°C', 60, 120, 86)] },
  { id: 'truck4', type: 'HaulTruck', label: 'Haul Truck D', group: 'Upstream', tier: 'aux', pos: [-45, 0, -5], accent: '#e7b53c', route: 0.74,
    metrics: [m('payload', 'Payload', 't', 0, 240, 0), m('speed', 'Ground Speed', 'km/h', 0, 60, 28), m('fuel', 'Fuel Level', '%', 0, 100, 63), m('engineTemp', 'Engine Temp', '°C', 60, 120, 83)] },
  { id: 'truck5', type: 'HaulTruck', label: 'Haul Truck E', group: 'Upstream', tier: 'aux', pos: [-58, 0, 7], accent: '#e7b53c', route: 0.9,
    metrics: [m('payload', 'Payload', 't', 0, 240, 0), m('speed', 'Ground Speed', 'km/h', 0, 60, 0), m('fuel', 'Fuel Level', '%', 0, 100, 80), m('engineTemp', 'Engine Temp', '°C', 60, 120, 78)] },

  // ───────────────── PROCESSING ─────────────────
  { id: 'crusher', type: 'Crusher', label: 'Primary Crusher', group: 'Processing', tier: 'hero', pos: [-30, 0, 0], accent: '#7f8a9b',
    metrics: [m('throughput', 'Throughput', 't/h', 0, 4000, 2240), m('power', 'Motor Power', 'kW', 0, 1000, 612), m('css', 'Closed Side Set', 'mm', 80, 220, 145), m('bearingTemp', 'Bearing Temp', '°C', 0, 120, 61)] },
  { id: 'screen', type: 'Screen', label: 'Vibrating Screen', group: 'Processing', tier: 'aux', pos: [-20, 0, 0], accent: '#7f8a9b',
    metrics: [m('throughput', 'Throughput', 't/h', 0, 4000, 1980), m('efficiency', 'Screen Eff.', '%', 0, 100, 93), m('amplitude', 'Amplitude', 'mm', 0, 12, 5.7)] },
  { id: 'mill', type: 'SagMill', label: 'SAG Mill', group: 'Processing', tier: 'hero', pos: [-8, 0, 0], accent: '#8a929b',
    metrics: [m('load', 'Mill Load', '%', 0, 60, 34), m('power', 'Motor Power', 'kW', 0, 9000, 5920), m('feedRate', 'Feed Rate', 't/h', 0, 3000, 1940), m('bearingPressure', 'Bearing Press.', 'bar', 0, 80, 44)] },
  { id: 'cyclone', type: 'Hydrocyclone', label: 'Hydrocyclone', group: 'Processing', tier: 'aux', pos: [3, 0, 7], accent: '#d9a441',
    metrics: [m('feedPressure', 'Feed Pressure', 'bar', 0, 3, 0.95), m('density', 'Density', '%', 0, 80, 60), m('throughput', 'Throughput', 'm³/h', 0, 4000, 2150)] },
  { id: 'flotation', type: 'Flotation', label: 'Flotation Bank', group: 'Processing', tier: 'hero', pos: [15, 0, 0], accent: '#5aa9b8',
    metrics: [m('recovery', 'Cu Recovery', '%', 0, 100, 89), m('airFlow', 'Air Flow', 'Nm³/h', 0, 1200, 545), m('pH', 'Pulp pH', '', 0, 14, 10.9), m('froth', 'Froth Depth', 'mm', 0, 400, 150)] },
  { id: 'thickener', type: 'Thickener', label: 'Thickener', group: 'Processing', tier: 'hero', pos: [30, 0, 0], accent: '#5a7fa8',
    metrics: [m('bedLevel', 'Bed Level', '%', 0, 100, 55), m('torque', 'Rake Torque', '%', 0, 100, 38), m('underflowDensity', 'U/F Density', '%', 0, 80, 62)] },
  { id: 'filter', type: 'FilterPress', label: 'Filter Press', group: 'Processing', tier: 'aux', pos: [42, 0, -7], accent: '#8a929b',
    metrics: [m('cycleTime', 'Cycle Time', 'min', 0, 60, 12), m('cakeMoisture', 'Cake Moisture', '%', 0, 25, 9), m('throughput', 'Throughput', 't/h', 0, 200, 88)] },
  { id: 'stacker', type: 'RadialStacker', label: 'Radial Stacker', group: 'Processing', tier: 'hero', pos: [42, 0, 9], accent: '#e7b53c',
    metrics: [m('stackRate', 'Stack Rate', 't/h', 0, 200, 88), m('stockpile', 'Stockpile', 't', 0, 50000, 13200), m('slew', 'Slew Angle', '°', -45, 45, 22)] },

  // ───────────────── DOWNSTREAM ─────────────────
  { id: 'rail', type: 'RailLoadout', label: 'Rail Loadout', group: 'Downstream', tier: 'hero', pos: [58, 0, 8], accent: '#7f8a9b',
    metrics: [m('loadRate', 'Load Rate', 't/h', 0, 4000, 1850), m('wagons', 'Wagons Loaded', '', 0, 120, 24), m('binLevel', 'Bin Level', '%', 0, 100, 64)] },
  { id: 'shiploader', type: 'ShipLoader', label: 'Ship Loader', group: 'Downstream', tier: 'hero', pos: [74, 0, -4], accent: '#e7b53c',
    metrics: [m('loadRate', 'Load Rate', 't/h', 0, 6000, 2450), m('boomAngle', 'Boom Angle', '°', -15, 30, 7), m('throughput', 'Throughput', 't', 0, 80000, 39000)] },
  { id: 'ship', type: 'BulkCarrier', label: 'Bulk Carrier', group: 'Downstream', tier: 'aux', pos: [88, 0, -14], accent: '#9c4a3c',
    metrics: [m('cargo', 'Cargo Loaded', 't', 0, 120000, 32400), m('draft', 'Draft', 'm', 0, 18, 11), m('holdLevel', 'Hold Level', '%', 0, 100, 56)] },
  { id: 'smelter', type: 'Smelter', label: 'Customer Smelter', group: 'Downstream', tier: 'hero', pos: [78, 0, -28], accent: '#b56a3c',
    metrics: [m('throughput', 'Throughput', 't/h', 0, 400, 138), m('furnaceTemp', 'Furnace Temp', '°C', 0, 1500, 1225), m('matteGrade', 'Matte Grade', '%', 0, 80, 67)] },
]

export const ASSET_BY_ID = Object.fromEntries(ASSETS.map(a => [a.id, a]))

// Process material-flow segments: [fromId, toId, medium]
export const FLOW = [
  ['crusher', 'screen', 'ore'], ['screen', 'mill', 'ore'], ['mill', 'cyclone', 'ore'],
  ['cyclone', 'flotation', 'ore'], ['flotation', 'thickener', 'concentrate'],
  ['thickener', 'filter', 'concentrate'], ['filter', 'stacker', 'concentrate'],
  ['stacker', 'rail', 'concentrate'], ['rail', 'shiploader', 'concentrate'],
  ['shiploader', 'ship', 'concentrate'], ['flotation', 'thickener', 'tailings'],
]
export const MEDIUM_COLOR = { ore: '#b07a3c', concentrate: '#34d399', water: '#38bdf8', tailings: '#f43f5e' }

// Haul-road centreline (trucks animate along this), pit → crusher
export const HAUL_ROAD = [
  [-54, 0, -2], [-50, 0, 2], [-44, 0, 5], [-40, 0, 2], [-36, 0, -1], [-32, 0, 0], [-30, 0, 0],
]

// Closed haul loop the running trucks circulate (pit ↔ crusher).
export const HAUL_LOOP = [
  [-30, 0, 1], [-37, 0, 5], [-45, 0, 7], [-53, 0, 4], [-58, 0, -2],
  [-53, 0, -7], [-44, 0, -6], [-36, 0, -3], [-31, 0, -1],
]

// Hi-vis crew. `path` = patrol (walks between 2 points); `pos` = stands & works.
const V = { o: '#f5821f', g: '#c4d92e', b: '#2f7fd0' }
const H = { y: '#f2c40d', w: '#e8edf2', b: '#2f7fd0' }
export const WORKERS = [
  { path: [[-6, 0, -22], [3, 0, -22]], vest: V.o, hat: H.w },     // control room
  { pos: [-3, 0, -28], vest: V.g, hat: H.y, rot: 2.6 },           // control room desk
  { path: [[-12, 0, 4], [-4, 0, 4]], vest: V.o, hat: H.y },       // mill walk
  { pos: [-6, 0, 3.4], vest: V.g, hat: H.b, rot: -1.2 },          // mill inspect
  { path: [[11, 0, 3.5], [19, 0, 3.5]], vest: V.o, hat: H.y },    // flotation walkway
  { pos: [15, 0, 2.4], vest: V.g, hat: H.w, rot: 0.4 },           // flotation
  { pos: [-33, 0, 3], vest: V.o, hat: H.b, rot: 1.0 },            // crusher
  { path: [[26, 0, 4.5], [34, 0, 4.5]], vest: V.g, hat: H.y },    // thickener
  { pos: [44, 0, -4], vest: V.o, hat: H.w, rot: -0.6 },           // filter press
  { path: [[54, 0, 11], [62, 0, 11]], vest: V.o, hat: H.y },      // rail loadout
  { pos: [70, 0, 1.5], vest: V.g, hat: H.b, rot: -1.4 },          // ship loader
  { path: [[-2, 0, 6], [7, 0, 6]], vest: V.o, hat: H.w },         // plant centre
]
