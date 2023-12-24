import 'server-cli-only'

import pino from 'pino'

import { config } from './config'

export const logger = pino({
  level: config.LOG_LEVEL,

  ...(process.env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }
    : {}),
})
