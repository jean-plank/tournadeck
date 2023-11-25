import { Effect, pipe } from 'effect'
import { either } from 'fp-ts'
import * as D from 'io-ts/Decoder'

import type { EffecT } from '../utils/fp'
import type { WithDb } from './helpers/WithDb'

const ResultCodec = D.struct({ ok: D.number })

export class HealthCheckPersistence {
  check: EffecT<boolean>

  constructor(private withDb: WithDb) {
    this.check = pipe(
      withDb.effect(db => db.command({ ping: 1 })),
      Effect.map(res => {
        const decoded = ResultCodec.decode(res)
        return either.isRight(decoded) && decoded.right.ok === 1
      }),
    )
  }
}
