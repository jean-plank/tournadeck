import { createEnum } from '../../utils/createEnum'

type ChampionFaction = typeof ChampionFaction.T

const ChampionFaction = createEnum(
  'bandle',
  'bilgewater',
  'demacia',
  'freljord',
  'ionia',
  'ixtal',
  'noxus',
  'piltover',
  'shadowIsles',
  'shurima',
  'targon',
  'void',
  'zaun',
)

export { ChampionFaction }
