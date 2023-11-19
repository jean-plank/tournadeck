import 'server-only'

import { Effect } from 'effect'
import type { Logger } from 'pino'
import pino from 'pino'
import pinoPretty from 'pino-pretty'

import { LevelWithSilent } from '@/models/LevelWithSilent'
import type { EffecT } from '@/utils/fp'
import { emptyRecord } from '@/utils/fp'

type LogFn = (arg: unknown, ...args: unknown[]) => EffecT<never, void>

export class LoggerGetter {
  private logger: Logger<{ level: LevelWithSilent }>

  constructor(logLevel: LevelWithSilent) {
    this.logger = pino({ level: logLevel }, pinoPretty({ colorize: true }))
  }

  apply(loggerName: string): ReadonlyRecord<LevelWithSilent, LogFn> {
    const child = this.logger.child({ name: loggerName })
    return LevelWithSilent.values.reduce(
      (acc, level): ReadonlyRecord<LevelWithSilent, LogFn> => ({
        ...acc,
        [level]: ((arg, ...args) =>
          Effect.sync(() => child[level](arg as string, ...args))) satisfies LogFn,
      }),
      emptyRecord<LevelWithSilent, LogFn>(),
    )
  }
}
