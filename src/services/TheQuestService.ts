import type { Config } from '../config/Config'
import { HttpClient } from '../helpers/HttpClient'
import type { GameId } from '../models/riot/GameId'
import type { Puuid } from '../models/riot/Puuid'
import type { RiotId } from '../models/riot/RiotId'
import type { Platform } from '../models/theQuest/Platform'
import { SummonerShort } from '../models/theQuest/SummonerShort'
import { TheQuestMatch } from '../models/theQuest/TheQuestMatch'
import { StaticData } from '../models/theQuest/staticData/StaticData'

const cacheDuration = 30 * 60 // seconds

type TheQuestService = ReturnType<typeof TheQuestService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function TheQuestService(config: Config, httpClient: HttpClient) {
  return {
    getStaticData,
    getSummonerByPuuid,
    getSummonerByRiotId,
    /**
     * @deprecated useless for custom matches (TODO)
     */
    getMatchById,
  }

  function getStaticData(silent?: boolean): Promise<StaticData> {
    return httpClient.get(
      `${config.THE_QUEST_API_URL}/staticData/fr_FR`,
      { next: { revalidate: cacheDuration }, silent },
      [StaticData.decoder, 'StaticData'],
    )
  }

  function getSummonerByPuuid(
    platform: Platform,
    puuid: Puuid,
    silent?: boolean,
  ): Promise<Optional<SummonerShort>> {
    return httpClient
      .get(
        `${config.THE_QUEST_API_URL}/summoner/byPuuid/${platform}/${puuid}`,
        { next: { revalidate: cacheDuration }, silent },
        [SummonerShort.codec, 'SummonerShort'],
      )
      .catch(HttpClient.statusesToUndefined(404))
  }

  function getSummonerByRiotId(
    platform: Platform,
    { gameName, tagLine }: RiotId,
    silent?: boolean,
  ): Promise<Optional<SummonerShort>> {
    return httpClient
      .get(
        `${config.THE_QUEST_API_URL}/summoner/byRiotId/${platform}/${gameName}/${tagLine}`,
        { next: { revalidate: cacheDuration }, silent },
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
