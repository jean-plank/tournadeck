import { Config } from './Config'
import { Logger } from './Logger'
import { AdminPocketBase } from './services/adminPocketBase/AdminPocketBase'

const config = Config.load()

const getLogger = Logger(config.LOG_LEVEL)

export const adminPocketBase = AdminPocketBase.load(config, getLogger)
