import { ClientResponseError } from 'pocketbase'
import util from 'util'

import { config } from '../../config'
import { subscribeCollection } from '../../helpers/subscribeCollection'
import { logger } from '../../logger'
import { DayjsDuration } from '../../models/Dayjs'
import { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import { sleep } from '../../utils/promiseUtils'
import { applyFixturesIfDbIsEmpty } from './applyFixturesIfDbIsEmpty'
import { initPocketBaseIfPbEmpty } from './initPocketBaseIfPbEmpty'

const retryDelay = DayjsDuration({ seconds: 1 })

export const adminPocketBase: Promise<MyPocketBase> = loadPocketBaseWithRetry()

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
      const originalError: string =
        e.originalError.cause instanceof Error
          ? `${e.originalError.cause.name}: ${e.originalError.cause.message}`
          : util.inspect(e.originalError)

      logger.error(`Failed to connect to PocketBase: ${originalError}`)
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
    await initPocketBaseIfPbEmpty(pb)
  } else {
    await pb.admins.authWithPassword(
      config.POCKET_BASE_ADMIN_EMAIL,
      config.POCKET_BASE_ADMIN_PASSWORD,
    )
  }

  logger.info('Connected to PocketBase')

  await subscribeAll(pb)

  if (isDev) {
    await applyFixturesIfDbIsEmpty(pb)
  }

  return pb
}

async function subscribeAll(pb: MyPocketBase): Promise<void> {
  logger.debug('Subscribing all...')

  await subscribeCollection(pb, 'matches', '*', e => {
    console.log(`matches ${e.action}:`, e)
  })

  logger.info('Subscribed all')
}
