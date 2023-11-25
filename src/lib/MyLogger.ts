import 'server-only'

import { Effect } from 'effect'
import pino from 'pino'
import pinoPretty from 'pino-pretty'
import util from 'util'

import type { LevelWithSilent } from './models/LevelWithSilent'
import type { EffecT } from './utils/fp'

export type MyLoggerGetter = (name: string) => MyLogger

type LogFn = (arg: unknown, ...args: unknown[]) => EffecT<void>

export class MyLogger implements ReadonlyRecord<LevelWithSilent, LogFn> {
  fatal: LogFn
  error: LogFn
  warn: LogFn
  info: LogFn
  debug: LogFn
  trace: LogFn
  silent: LogFn

  constructor(logLevel: LevelWithSilent, name: string) {
    const child = pino({ level: logLevel }, pinoPretty({ colorize: true })).child({ name })

    this.fatal = log('fatal')
    this.error = log('error')
    this.warn = log('warn')
    this.info = log('info')
    this.debug = log('debug')
    this.trace = log('trace')
    this.silent = log('silent')

    function log(level: LevelWithSilent): LogFn {
      return (arg, ...args) => Effect.sync(() => child[level](util.format(arg, ...args)))
    }
  }
}
