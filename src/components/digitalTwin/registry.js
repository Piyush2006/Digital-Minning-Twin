import { memo } from 'react'
import { Exploration, DrillRig, BlastBench, Shovel, HaulTruck } from './Mine/Mine'
import { Crusher, Screen, SagMill, Hydrocyclone, Flotation, Thickener, FilterPress, RadialStacker } from './Processing/Processing'
import { RailLoadout, ShipLoader, BulkCarrier, Smelter } from './Logistics/Logistics'

// Memoized so hovering/zooming an asset (AssetNode re-render) never re-runs its geometry.
const raw = {
  Exploration, DrillRig, BlastBench, Shovel, HaulTruck,
  Crusher, Screen, SagMill, Hydrocyclone, Flotation, Thickener, FilterPress, RadialStacker,
  RailLoadout, ShipLoader, BulkCarrier, Smelter,
}
export const EQUIPMENT = Object.fromEntries(Object.entries(raw).map(([k, C]) => [k, memo(C)]))

// Approx card anchor height per type (metres above origin)
export const CARD_HEIGHT = {
  DrillRig: 13, Shovel: 7, HaulTruck: 5.5, BlastBench: 7, Exploration: 6.5,
  Crusher: 8, Screen: 4.5, SagMill: 7.5, Hydrocyclone: 5, Flotation: 5.5,
  Thickener: 5, FilterPress: 4.5, RadialStacker: 9,
  RailLoadout: 8, ShipLoader: 10.5, BulkCarrier: 12, Smelter: 11,
}
