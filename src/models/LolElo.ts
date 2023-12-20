import { record } from 'fp-ts'

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
const values = record.keys(label).sort((a, b) => {
  const order = {
    iron: 1,
    bronze: 2,
    silver: 3,
    gold: 4,
    platinum: 5,
    diamond: 6,
    master: 7,
    grandmaster: 8,
    challenger: 9,
  }
  return order[a] - order[b]
})
const LolElo = { label, values }

export { LolElo }
