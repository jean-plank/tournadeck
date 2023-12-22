type ChampionPool = (typeof values)[number]

const values = ['oneTrick', 'limited', 'modest', 'notBad', 'quiteALot'] as const

const label: Record<ChampionPool, string> = {
  oneTrick: "J'ai un seul poney à mon arc",
  limited: 'Limité',
  modest: 'Modeste',
  notBad: 'Pas mal',
  quiteALot: 'Ça fait beaucoup là, non ?',
}

const ChampionPool = { values, label }

export { ChampionPool }
