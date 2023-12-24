import { createEnum } from '../utils/createEnum'

type LolElo = typeof e.T

const e = createEnum(
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'emerald',
  'diamond',
  'master',
  'grandmaster',
  'challenger',
)

const label: ReadonlyRecord<LolElo, string> = {
  iron: 'Fer',
  bronze: 'Bronze',
  silver: 'Argent',
  gold: 'Or',
  platinum: 'Platine',
  emerald: 'Émeraude',
  diamond: 'Diamant',
  master: 'Maître',
  grandmaster: 'Grand Maître',
  challenger: 'Challenger',
}

const LolElo = { ...e, label }

export { LolElo }
