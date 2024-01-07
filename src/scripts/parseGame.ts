import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import fs from 'fs/promises'
import * as D from 'io-ts/Decoder'

import { Logger } from '../Logger'
import { Config } from '../config/Config'
import { constants } from '../config/constants'
import { HttpClient } from '../helpers/HttpClient'
import type { ChampionId } from '../models/riot/ChampionId'
import { ChampionKey } from '../models/riot/ChampionKey'
import { LCUMatch } from '../models/riot/LCUMatch'
import type { Puuid } from '../models/riot/Puuid'
import type { RiotId } from '../models/riot/RiotId'
import { TheQuestMatch } from '../models/theQuest/TheQuestMatch'
import { TheQuestService } from '../services/TheQuestService'
import { eitherGetOrThrow } from '../utils/fpTsUtils'
import { decodeError } from '../utils/ioTsUtils'
import { loadDotenv } from './helpers/loadDotenv'

loadDotenv()

const argvDecoder = D.tuple(D.id<unknown>(), D.id<unknown>(), D.string)

async function parseGame(): Promise<void> {
  const config = Config.load()

  const getLogger = Logger(config.LOG_LEVEL)

  const httpClient = HttpClient(getLogger)

  const theQuestService = TheQuestService(config, httpClient)

  const [, , jsonFile] = pipe(
    argvDecoder.decode(process.argv),
    either.mapLeft(decodeError('Argv')(process.argv)),
    eitherGetOrThrow,
  )

  const rawJson = await fs.readFile(jsonFile, 'utf-8')

  const json = JSON.parse(rawJson)

  const lcuMatch = pipe(
    LCUMatch.decoder.decode(json),
    either.mapLeft(decodeError('LCUMatch')(json)),
    eitherGetOrThrow,
  )

  const staticData = await theQuestService.getStaticData()

  const theQuestMatch = await pipe(
    lcuMatch,
    LCUMatch.toTheQuestMatch(championIdFromKey, puuidFromRiotId),
  )

  console.log()
  console.log(JSON.stringify(TheQuestMatch.codec.encode(theQuestMatch)))
  console.log()

  function championIdFromKey(id: ChampionKey): Optional<ChampionId> {
    return staticData.champions.find(c => ChampionKey.Eq.equals(c.key, id))?.id
  }

  async function puuidFromRiotId(riotId: RiotId): Promise<Optional<Puuid>> {
    const summoner = await theQuestService.getSummonerByRiotId(constants.platform, riotId)

    return summoner?.puuid
  }
}

parseGame()
