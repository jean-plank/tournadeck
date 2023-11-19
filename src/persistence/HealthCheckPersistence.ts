import { Effect } from 'effect'
import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import type { WithDb } from '@/persistence/helpers/WithDb'
import type { EffecT } from '@/utils/fp'

const ResultCodec = D.struct({ ok: D.number })

export class HealthCheckPersistence {
  check: EffecT<Error, boolean>

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
