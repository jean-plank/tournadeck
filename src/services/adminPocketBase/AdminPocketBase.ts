import { ClientResponseError } from 'pocketbase'
import util from 'util'

import type { Config } from '../../Config'
import type { GetLogger, Logger } from '../../Logger'
import { subscribeCollection } from '../../helpers/subscribeCollection'
import { DayjsDuration } from '../../models/Dayjs'
import { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import { sleep } from '../../utils/promiseUtils'
import { applyFixturesIfDbIsEmpty } from './applyFixturesIfDbIsEmpty'
import { initPocketBaseIfPbEmpty } from './initPocketBaseIfPbEmpty'

const retryDelay = DayjsDuration({ seconds: 1 })

function load(config: Config, getLogger: GetLogger): Promise<MyPocketBase> {
  const logger = getLogger('AdminPocketBase')

  return loadPocketBaseWithRetry(config, logger)
}

async function loadPocketBaseWithRetry(
  config: Config,
  logger: Logger,
  isSilent: boolean = false,
): Promise<MyPocketBase> {
  try {
    return await loadPocketBase(config, logger)
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
      const originalError: string =
        e.originalError.cause instanceof Error
          ? `${e.originalError.cause.name}: ${e.originalError.cause.message}`
          : util.inspect(e.originalError)

      logger.error(`Failed to connect to PocketBase: ${originalError}`)
    }

    await sleep(retryDelay)

    return await loadPocketBaseWithRetry(config, logger, true)
  }
}

async function loadPocketBase(config: Config, logger: Logger): Promise<MyPocketBase> {
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

  await subscribeAll(logger, pb)

  if (isDev) {
    await applyFixturesIfDbIsEmpty(logger, pb)
  }

  return pb
}

async function subscribeAll(logger: Logger, pb: MyPocketBase): Promise<void> {
  await subscribeCollection(logger, pb, 'matches', '*', e => {
    console.log(`matches ${e.action}:`, e)
  })
}

export const AdminPocketBase = { load }
