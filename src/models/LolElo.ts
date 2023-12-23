type LolElo = (typeof values)[number]

const values = [
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
] as const

const label: Record<LolElo, string> = {
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

const LolElo = { values, label }

export { LolElo }