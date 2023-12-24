import type { Config } from '../Config'
import { HttpClient } from '../helpers/HttpClient'
import type { GameId } from '../models/riot/GameId'
import type { Puuid } from '../models/riot/Puuid'
import type { RiotId } from '../models/riot/RiotId'
import type { Platform } from '../models/theQuest/Platform'
import { SummonerShort } from '../models/theQuest/SummonerShort'
import { TheQuestMatch } from '../models/theQuest/TheQuestMatch'

const cacheDuration = 5 // seconds

type TheQuestService = ReturnType<typeof TheQuestService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function TheQuestService(config: Config, httpClient: HttpClient) {
  return { getSummonerByPuuid, getSummonerByRiotId, getMatchById }

  function getSummonerByPuuid(
    platform: Platform,
    puuid: Puuid,
  ): Promise<SummonerShort | undefined> {
    return httpClient
      .get(
        `${config.THE_QUEST_API_URL}/summoner/byPuuid/${platform}/${puuid}`,
        { next: { revalidate: cacheDuration } },
        [SummonerShort.codec, 'SummonerShort'],
      )
      .catch(HttpClient.statusesToUndefined(404))
  }

  function getSummonerByRiotId(
    platform: Platform,
    { gameName, tagLine }: RiotId,
  ): Promise<SummonerShort | undefined> {
    return httpClient
      .get(
        `${config.THE_QUEST_API_URL}/summoner/byRiotId/${platform}/${gameName}/${tagLine}`,
        { next: { revalidate: cacheDuration } },
        [SummonerShort.codec, 'SummonerShort'],
      )
      .catch(HttpClient.statusesToUndefined(404))
  }

  function getMatchById(platform: Platform, gameId: GameId): Promise<TheQuestMatch> {
    return httpClient.get(
      `${config.THE_QUEST_API_URL}/madosayentisuto/match/${platform}/${gameId}`,
      { headers: { Authorization: config.THE_QUEST_TOKEN }, cache: 'no-store' },
      [TheQuestMatch.codec, 'TheQuestMatch'],
    )
  }
}

export { TheQuestService }
