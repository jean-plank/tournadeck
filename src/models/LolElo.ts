import { readonlyRecord } from 'fp-ts'

type LolElo =
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster'
  | 'challenger'

const label: Record<LolElo, string> = {
  iron: 'Fer',
  bronze: 'Bronze',
  silver: 'Argent',
  gold: 'Or',
  platinum: 'Platine',
  diamond: 'Diamant',
  master: 'Maître',
  grandmaster: 'Grand Maître',
  challenger: 'Challengeur',
}
const values = readonlyRecord.keys(label)
const LolElo = { label, values }

export { LolElo }
