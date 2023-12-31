import { Config } from '../Config'
import { Logger } from '../Logger'
import { HttpClient } from '../helpers/HttpClient'
import { TheQuestService } from '../services/TheQuestService'

export const config = Config.load()

export const getLogger = Logger(config.LOG_LEVEL)

const httpClient = HttpClient(getLogger)

export const theQuestService = TheQuestService(config, httpClient)
