import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import { AdminPocketBase } from '../../services/adminPocketBase/AdminPocketBase'
import { config, getLogger, theQuestService } from '../context'

let adminPocketBase_: Optional<Promise<MyPocketBase>> = undefined

export function adminPocketBase(): Promise<MyPocketBase> {
  if (adminPocketBase_ !== undefined) return adminPocketBase_

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithAdminPocketBase = global as typeof globalThis & {
      adminPocketBase_?: Promise<MyPocketBase>
    }

    if (globalWithAdminPocketBase.adminPocketBase_ === undefined) {
      globalWithAdminPocketBase.adminPocketBase_ = AdminPocketBase.load(
        config,
        getLogger,
        theQuestService,
      )
      adminPocketBase_ = globalWithAdminPocketBase.adminPocketBase_
    }

    return globalWithAdminPocketBase.adminPocketBase_
  }

  // In production mode, it's best to not use a global variable.

  adminPocketBase_ = AdminPocketBase.load(config, getLogger, theQuestService)

  return adminPocketBase_
}
