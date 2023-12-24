import type { ChampionId } from '../models/riot/ChampionId'
import type { DDragonVersion } from '../models/riot/DDragonVersion'

export const DDragonUtils = {
  champion: {
    square: (version: DDragonVersion, id: ChampionId): string =>
      ddragonCdn(version, `/img/champion/${id}.png`),
  },
}

function ddragonCdn(version: DDragonVersion, path: string): string {
  return ddragon(`/cdn/${version}${path}`)
}

function ddragon(path: string): string {
  return `https://ddragon.leagueoflegends.com${path}`
}
