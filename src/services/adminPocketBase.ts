import { config } from '../config'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'

export const adminPocketBase: Promise<MyPocketBase> = loadPb()

async function loadPb(): Promise<MyPocketBase> {
  const pb = MyPocketBase()

  await pb.admins.authWithPassword(config.ADMIN_PB_USERNAME, config.ADMIN_PB_PASSWORD)

  return pb
}
