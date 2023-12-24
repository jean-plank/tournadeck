import type { AdminAuthResponse } from 'pocketbase'
import { ClientResponseError } from 'pocketbase'

import type { Config } from '../../Config'
import type { Logger } from '../../Logger'
import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'

export async function initPocketBaseIfPbEmpty(
  config: Config,
  logger: Logger,
  pb: MyPocketBase,
): Promise<void> {
  const response = await authWithPassword(config, pb).catch(e => {
    if (
      e instanceof ClientResponseError &&
      e.status === 400 &&
      e.response.message === 'Failed to authenticate.'
    ) {
      return undefined
    }
    throw e
  })

  const isEmpty = response === undefined

  if (!isEmpty) {
    logger.info('PocketBase admin: not empty')
    return
  }

  logger.debug('Creating PocketBase admin and setting up Discord OAuth2...')

  await pb.admins.create({
    email: config.POCKET_BASE_ADMIN_EMAIL,
    password: config.POCKET_BASE_ADMIN_PASSWORD,
    passwordConfirm: config.POCKET_BASE_ADMIN_PASSWORD,
  })

  await authWithPassword(config, pb)

  await pb.settings.update({
    discordAuth: {
      enabled: true,
      clientId: config.DISCORD_CLIENT_ID,
      clientSecret: config.DISCORD_CLIENT_SECRET,
    },
  })

  logger.info('Created PocketBase admin and set up Discord OAuth2')
}

function authWithPassword(config: Config, pb: MyPocketBase): Promise<AdminAuthResponse> {
  return pb.admins.authWithPassword(
    config.POCKET_BASE_ADMIN_EMAIL,
    config.POCKET_BASE_ADMIN_PASSWORD,
    { cache: 'no-store' },
  )
}
