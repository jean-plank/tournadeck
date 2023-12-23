import { config } from '../../config'
import { subscribeCollection } from '../../helpers/subscribeCollection'
import { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import { applyFixturesIfDbIsEmpty } from './applyFixturesIfDbIsEmpty'
import { initPocketBaseIfPbEmpty } from './initPocketBaseIfPbEmpty'

export const adminPocketBase: Promise<MyPocketBase> = loadPb()

async function loadPb(): Promise<MyPocketBase> {
  const isDev = process.env.NODE_ENV === 'development'

  const pb = MyPocketBase()

  if (isDev) {
    await initPocketBaseIfPbEmpty(pb)
  } else {
    await pb.admins.authWithPassword(
      config.POCKET_BASE_ADMIN_EMAIL,
      config.POCKET_BASE_ADMIN_PASSWORD,
    )
  }

  await subscribeAll(pb)

  if (isDev) {
    await applyFixturesIfDbIsEmpty(pb)
  }

  return pb
}

async function subscribeAll(pb: MyPocketBase): Promise<void> {
  await subscribeCollection(pb, 'matches', '*', e => {
    console.log(`matches ${e.action}:`, e)
  })
}
