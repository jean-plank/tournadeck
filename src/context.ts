import { Config } from './Config'
import { Logger } from './Logger'
import { HttpClient } from './helpers/HttpClient'
import { TheQuestService } from './services/TheQuestService'
import { AdminPocketBase } from './services/adminPocketBase/AdminPocketBase'

const config = Config.load()

export const getLogger = Logger(config.LOG_LEVEL)

const httpClient = HttpClient(getLogger)

export const theQuestService = TheQuestService(config, httpClient)

export const adminPocketBase = AdminPocketBase.load(config, getLogger, theQuestService)
