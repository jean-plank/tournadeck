import { constants } from '../config/constants'
import { RiotId } from '../models/riot/RiotId'

const baseUrl = 'https://laquete.blbl.ch'

function summonerUrl(riotId: RiotId): string {
  return `${baseUrl}/${constants.platform.toLowerCase()}/${RiotId.stringify('-')(riotId)}?level=all`
}

export const TheQuestUtils = { summonerUrl }
