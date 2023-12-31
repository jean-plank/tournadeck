import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import { AdminPocketBase } from '../../services/adminPocketBase/AdminPocketBase'
import { config, getLogger, theQuestService } from '../context'

// eslint-disable-next-line @typescript-eslint/init-declarations
let adminPocketBase: Promise<MyPocketBase>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithAdminPocketBase = global as typeof globalThis & {
    _adminPocketBase?: Promise<MyPocketBase>
  }

  if (globalWithAdminPocketBase._adminPocketBase === undefined) {
    globalWithAdminPocketBase._adminPocketBase = AdminPocketBase.load(
      config,
      getLogger,
      theQuestService,
    )
  }

  adminPocketBase = globalWithAdminPocketBase._adminPocketBase
} else {
  // In production mode, it's best to not use a global variable.
  adminPocketBase = AdminPocketBase.load(config, getLogger, theQuestService)
}

export { adminPocketBase }
