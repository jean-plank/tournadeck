import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { revalidateTag } from 'next/cache'
import type { RecordSubscription } from 'pocketbase'
import { ClientResponseError } from 'pocketbase'
import util from 'util'

import { Config } from '../../Config'
import type { GetLogger } from '../../Logger'
import { listMatchesTag } from '../../actions/matchesTag'
import { subscribeCollection } from '../../helpers/subscribeCollection'
import { DayjsDuration } from '../../models/Dayjs'
import { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { Match } from '../../models/pocketBase/tables/match/Match'
import { MatchApiData } from '../../models/pocketBase/tables/match/MatchApiData'
import { TheQuestMatch } from '../../models/theQuest/TheQuestMatch'
import { decodeErrorString } from '../../utils/ioTsUtils'
import { sleep } from '../../utils/promiseUtils'
import type { TheQuestService } from '../TheQuestService'
import { applyFixturesIfDbIsEmpty } from './applyFixturesIfDbIsEmpty'
import { initPocketBaseIfPbEmpty } from './initPocketBaseIfPbEmpty'

const retryDelay = DayjsDuration({ seconds: 1 })

function load(
  config: Config,
  getLogger: GetLogger,
  theQuestService: TheQuestService,
): Promise<MyPocketBase> {
  const logger = getLogger('AdminPocketBase')

  return loadPocketBaseWithRetry()

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

    const pb = MyPocketBase()

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
          MatchApiData.codec.decode(event.record.apiData),
          either.fold(
            e => {
              logger.warn(
                `Invalid match ${event.action}: ${decodeErrorString('MatchApiData')(
                  event.record.apiData,
                )(e)}`,
              )
            },
            async apiData => {
              if (MatchApiData.isGameId(apiData)) {
                const newApiData = await theQuestService
                  .getMatchById(Config.constants.platform, apiData)
                  .catch(e => {
                    logger.warn(`Failed to get match ${apiData}: ${formatError(e)}`)
                  })

                if (newApiData !== undefined) {
                  await pb.collection('matches').update(event.record.id, {
                    apiData: TheQuestMatch.codec.encode(newApiData),
                  })

                  revalidateTag(listMatchesTag)
                }
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
