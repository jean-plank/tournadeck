import type { Config } from '../Config'
import { type HttpClient } from '../helpers/HttpClient'
import type { GameId } from '../models/riot/GameId'
import type { Platform } from '../models/theQuest/Platform'
import { TheQuestMatch } from '../models/theQuest/TheQuestMatch'

type TheQuestService = ReturnType<typeof TheQuestService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function TheQuestService(config: Config, httpClient: HttpClient) {
  return { getMatchById }

  async function getMatchById(platform: Platform, gameId: GameId): Promise<TheQuestMatch> {
    return httpClient.get(
      `${config.THE_QUEST_API_URL}/madosayentisuto/match/${platform}/${gameId}`,
      { headers: { Authorization: config.THE_QUEST_TOKEN }, cache: 'no-store' },
      [TheQuestMatch.codec, 'TheQuestMatch'],
    )
  }
}

export { TheQuestService }
