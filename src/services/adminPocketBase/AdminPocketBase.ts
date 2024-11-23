import 'server-cli-only'

import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import type { RecordSubscription } from 'pocketbase'
import { ClientResponseError } from 'pocketbase'
import util from 'util'

import type { GetLogger } from '../../Logger'
import type { Config } from '../../config/Config'
import { constants } from '../../config/constants'
import { subscribeCollection } from '../../helpers/subscribeCollection'
import { DayjsDuration } from '../../models/Dayjs'
import { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { Match } from '../../models/pocketBase/tables/match/Match'
import { MatchApiData, MatchApiDatas } from '../../models/pocketBase/tables/match/MatchApiDatas'
import { decodeErrorString } from '../../utils/ioTsUtils'
import { sleep } from '../../utils/promiseUtils'
import type { TheQuestService } from '../TheQuestService'
import { applyFixturesIfDbIsEmpty } from './applyFixturesIfDbIsEmpty'
import { initPocketBaseIfPbEmpty } from './initPocketBaseIfPbEmpty'

const retryDelay = DayjsDuration({ seconds: 1 })

async function load(
  config: Config,
  getLogger: GetLogger,
  theQuestService: TheQuestService,
): Promise<MyPocketBase> {
  const logger = getLogger('AdminPocketBase')

  return await loadPocketBaseWithRetry()

  async function loadPocketBaseWithRetry(isSilent: boolean = false): Promise<MyPocketBase> {
    try {
      return await loadPocketBase()
    } catch (e) {
      if (
        !(
          e instanceof ClientResponseError &&
          e.originalError instanceof TypeError &&
          e.originalError.message === 'fetch failed'
        )
      ) {
        throw e
      }

      if (!isSilent) {
        logger.error(`Failed to connect to PocketBase: ${formatError(e.originalError.cause)}`)
      }

      await sleep(retryDelay)

      return await loadPocketBaseWithRetry(true)
    }
  }

  async function loadPocketBase(): Promise<MyPocketBase> {
    const isDev = process.env.NODE_ENV === 'development'

    const pb = MyPocketBase(config.POCKET_BASE_URL)

    pb.autoCancellation(false)

    logger.debug('Connecting to PocketBase...')

    if (isDev) {
      await initPocketBaseIfPbEmpty(config, logger, pb)
    } else {
      await pb.admins.authWithPassword(
        config.POCKET_BASE_ADMIN_EMAIL,
        config.POCKET_BASE_ADMIN_PASSWORD,
      )
    }

    logger.info('Connected to PocketBase')

    await subscribeAll(pb)

    if (isDev) {
      await applyFixturesIfDbIsEmpty(logger, pb)
    }

    return pb
  }

  async function subscribeAll(pb: MyPocketBase): Promise<void> {
    await subscribeCollection(logger, pb, 'matches', '*', handleMatchesEvent)

    function handleMatchesEvent(event: RecordSubscription<Match>): void {
      if (event.action === 'create' || event.action === 'update') {
        pipe(
          MatchApiDatas.codec.decode(event.record.apiData),
          either.fold(
            e => {
              logger.warn(
                `Invalid match ${event.action}: ${decodeErrorString('MatchApiDatas')(
                  event.record.apiData,
                )(e)}`,
              )
            },
            async apiDatas => {
              if (apiDatas === null) return

              const newApiDatas = await Promise.all(
                apiDatas.map(async (apiData): Promise<MatchApiData> => {
                  if (!MatchApiData.isGameId(apiData)) return apiData

                  const newApiData = await theQuestService
                    .getMatchById(constants.platform, apiData)
                    .catch(e => {
                      logger.warn(`Failed to get match ${apiData}: ${formatError(e)}`)
                    })

                  if (newApiData === undefined) return apiData

                  return newApiData
                }),
              )

              if (!MatchApiDatas.Eq.equals(apiDatas, newApiDatas)) {
                await pb.collection('matches').update(event.record.id, {
                  apiData: MatchApiDatas.codec.encode(newApiDatas),
                })
              }
            },
          ),
        )
      }
    }
  }
}

export const AdminPocketBase = { load }

function formatError(e: unknown): string {
  return e instanceof Error ? `${e.name}: ${e.message}` : util.inspect(e)
}
