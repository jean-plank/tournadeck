import type { AdminAuthResponse } from 'pocketbase'
import { ClientResponseError } from 'pocketbase'

import { config } from '../../config'
import { logger } from '../../logger'
import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'

export async function initPocketBaseIfPbEmpty(pb: MyPocketBase): Promise<void> {
  const response = await authWithPassword(pb).catch(e => {
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
    logger.info('PocketBase: not empty')
    return
  }

  logger.info('Creating PocketBase admin and setting up Discord OAuth2')

  await pb.admins.create({
    email: config.POCKET_BASE_ADMIN_EMAIL,
    password: config.POCKET_BASE_ADMIN_PASSWORD,
    passwordConfirm: config.POCKET_BASE_ADMIN_PASSWORD,
  })

  await authWithPassword(pb)

  await pb.settings.update({
    discordAuth: {
      enabled: true,
      clientId: config.DISCORD_CLIENT_ID,
      clientSecret: config.DISCORD_CLIENT_SECRET,
    },
  })
}

function authWithPassword(pb: MyPocketBase): Promise<AdminAuthResponse> {
  return pb.admins.authWithPassword(
    config.POCKET_BASE_ADMIN_EMAIL,
    config.POCKET_BASE_ADMIN_PASSWORD,
    { cache: 'no-store' },
  )
}
