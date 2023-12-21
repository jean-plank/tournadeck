import type { AdminAuthResponse } from 'pocketbase'
import { ClientResponseError } from 'pocketbase'

import { config } from '../../config'
import { logger } from '../../logger'
import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { TableName } from '../../models/pocketBase/Tables'
import type { UserInput } from '../../models/pocketBase/tables/User'

export async function onDevelopmentServerStart(pb: MyPocketBase): Promise<void> {
  await initPocketBaseIfPbEmpty(pb)

  await applyFixturesIfDbIsEmpty(pb)

  const res = await pb.collection('test').getFullList()

  console.log('res =', res)
}

async function initPocketBaseIfPbEmpty(pb: MyPocketBase): Promise<void> {
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

// ---

async function applyFixturesIfDbIsEmpty(pb: MyPocketBase): Promise<void> {
  const isEmpty = await isDbEmpty(pb)

  if (!isEmpty) {
    logger.info('Fixtures: db is not empty')
    return
  }

  logger.info('Applying fixtures')

  await addFixtures(pb)
}

async function isDbEmpty(pb: MyPocketBase): Promise<boolean> {
  const collections = await pb.collections.getFullList({ cache: 'no-store' })

  const results = await Promise.all(
    collections.map(c => pb.collection(c.name as TableName).getList(1, 1, { cache: 'no-store' })),
  )

  return results.every(result => result.totalItems === 0)
}

export async function addFixtures(pb: MyPocketBase): Promise<void> {
  await pb.collection('users').create(genUser('jenaprank', 'Jena Prank', true))
  await pb.collection('users').create(genUser('lambertj', 'Jules Lambert'))
  await pb.collection('users').create(genUser('adedigado', 'Jean Prendnote'))
}

function genUser(username: string, displayName: string, isOrganiser = false): UserInput {
  const password = 'Password123'
  return {
    username,
    password,
    passwordConfirm: password,
    verified: true,
    emailVisibility: false,
    email: `${username}@x.t`,
    role: isOrganiser ? 'organiser' : 'attendee',
    displayName,
  }
}
