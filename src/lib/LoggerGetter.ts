import 'server-only'

import { Effect } from 'effect'
import type { Logger } from 'pino'
import pino from 'pino'
import pinoPretty from 'pino-pretty'

import { LevelWithSilent } from './models/LevelWithSilent'
import type { EffecT } from './utils/fp'
import { emptyRecord } from './utils/fp'

export type LoggerType = ReadonlyRecord<LevelWithSilent, LogFn>

type LogFn = (arg: unknown, ...args: unknown[]) => EffecT<void>

export class LoggerGetter {
  private logger: Logger<{ level: LevelWithSilent }>

  constructor(logLevel: LevelWithSilent) {
    this.logger = pino({ level: logLevel }, pinoPretty({ colorize: true }))
  }

  named(name: string): LoggerType {
    const child = this.logger.child({ name })
    return LevelWithSilent.values.reduce(
      (acc, level): LoggerType => ({
        ...acc,
        [level]: ((arg, ...args) =>
          Effect.sync(() => child[level](arg as string, ...args))) satisfies LogFn,
      }),
      emptyRecord<LevelWithSilent, LogFn>(),
    )
  }
}
