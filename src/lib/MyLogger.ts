import 'server-only'

import { Effect } from 'effect'
import pino from 'pino'
import pinoPretty from 'pino-pretty'
import util from 'util'

import { LevelWithSilent } from './models/LevelWithSilent'
import { brand } from './utils/brand'
import { type EffecT, recordEmpty } from './utils/fp'

export type MyLoggerGetter = (name: string) => MyLogger

type Tag = { readonly MyLogger: unique symbol }

type MyLogger = ReturnType<typeof MyLogger>

type LogFn = (arg: unknown, ...args: unknown[]) => EffecT<void>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function MyLogger(logLevel: LevelWithSilent, name: string) {
  const child = pino({ level: logLevel }, pinoPretty({ colorize: true })).child({ name })

  const res: ReadonlyRecord<LevelWithSilent, LogFn> = LevelWithSilent.values.reduce(
    (acc, level) => ({ ...acc, [level]: log(level) }),
    recordEmpty<LevelWithSilent, LogFn>(),
  )

  return brand<Tag>()(res)

  function log(level: LevelWithSilent): LogFn {
    return (arg, ...args) => Effect.sync(() => child[level](util.format(arg, ...args)))
  }
}

export { MyLogger }
