import { createEnum } from '../utils/createEnum'

type ChampionPool = typeof e.T

const e = createEnum('oneTrick', 'limited', 'modest', 'notBad', 'quiteALot')

const label: ReadonlyRecord<ChampionPool, string> = {
  oneTrick: "J'ai un seul poney à mon arc",
  limited: 'Limité',
  modest: 'Modeste',
  notBad: 'Pas mal',
  quiteALot: 'Ça fait beaucoup là, non ?',
}

const ChampionPool = { ...e, label }

export { ChampionPool }
