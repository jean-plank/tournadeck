import { Effect, pipe } from 'effect'
import { either } from 'fp-ts'
import * as D from 'io-ts/Decoder'

import { brand } from '../utils/brand'
import type { EffecT } from '../utils/fp'
import type { WithDb } from './helpers/WithDb'

type Tag = { readonly HealthCheckPersistence: unique symbol }

type HealthCheckPersistence = ReturnType<typeof HealthCheckPersistence>

const ResultCodec = D.struct({ ok: D.number })

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function HealthCheckPersistence(withDb: WithDb) {
  const check: EffecT<boolean> = pipe(
    withDb.effect(db => db.command({ ping: 1 })),
    Effect.map(res => {
      const decoded = ResultCodec.decode(res)
      return either.isRight(decoded) && decoded.right.ok === 1
    }),
  )

  return brand<Tag>()({
    check,
  })
}

export { HealthCheckPersistence }
