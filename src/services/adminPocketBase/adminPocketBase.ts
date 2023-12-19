import { config } from '../../config'
import { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import { onDevelopmentServerStart } from './onDevelopmentServerStart'

export const adminPocketBase: Promise<MyPocketBase> = loadPb()

async function loadPb(): Promise<MyPocketBase> {
  const pb = MyPocketBase()

  if (process.env.NODE_ENV === 'development') {
    await onDevelopmentServerStart(pb)
  } else {
    await pb.admins.authWithPassword(
      config.POCKET_BASE_ADMIN_EMAIL,
      config.POCKET_BASE_ADMIN_PASSWORD,
    )
  }

  return pb
}
