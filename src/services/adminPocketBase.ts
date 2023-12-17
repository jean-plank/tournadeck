import { config } from '../config'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'

const pb = MyPocketBase()

export const adminPocketBase: Promise<MyPocketBase> = pb.admins
  .authWithPassword(config.ADMIN_PB_USERNAME, config.ADMIN_PB_PASSWORD)
  .then(() => pb)
