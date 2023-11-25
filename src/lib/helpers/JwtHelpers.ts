import { Duration, Effect, pipe } from 'effect'
import type { DurationInput } from 'effect/Duration'
import type { Encoder } from 'io-ts/Encoder'
import jwt from 'jsonwebtoken'

import type { DecoderWithName } from '../models/ioTsModels'
import { Token } from '../models/user/Token'
import { EffecT, decodeEffecT, partialRecordEmpty, recordEntries } from '../utils/fp'

type MySignOptions = Omit<jwt.SignOptions, 'expiresIn' | 'notBefore'> & {
  expiresIn?: DurationInput
  notBefore?: DurationInput
}

type MyVerifyOptions = Omit<jwt.VerifyOptions, 'complete'>

export class JwtHelper {
  constructor(private secret: string) {}

  sign<O extends ReadonlyRecord<PropertyKey, unknown>, A>(
    encoder: Encoder<O, A>,
  ): (a: A, options?: MySignOptions) => EffecT<Token> {
    return (a, { expiresIn, notBefore, ...options } = {}) =>
      pipe(
        EffecT.tryPromise(
          () =>
            new Promise<Optional<string>>((resolve, reject) =>
              jwt.sign(
                encoder.encode(a),
                this.secret,
                {
                  ...options,
                  ...msDurationOptions({ expiresIn, notBefore }),
                },
                (err, encoded) => (err !== null ? reject(err) : resolve(encoded)),
              ),
            ),
        ),
        Effect.flatMap(res =>
          res !== undefined
            ? Effect.succeed(res)
            : Effect.fail(Error('undefined jwt (this should never happen)')),
        ),
        Effect.map(Token.wrap),
      )
  }

  verify<A>(
    decoder: DecoderWithName<string | jwt.JwtPayload, A>,
  ): (token: string, options?: MyVerifyOptions) => EffecT<A> {
    return (token, options) =>
      pipe(
        EffecT.tryPromise(
          () =>
            new Promise<Optional<string | jwt.JwtPayload>>((resolve, reject) =>
              jwt.verify(token, this.secret, { ...options, complete: false }, (err, decoded) =>
                err !== null ? reject(err) : resolve(decoded),
              ),
            ),
        ),
        Effect.flatMap(res =>
          res !== undefined
            ? Effect.succeed(res)
            : Effect.fail(Error('Undefined payload (this should never happen)')),
        ),
        Effect.flatMap(decodeEffecT(decoder)),
      )
  }
}

function msDurationOptions<K extends PropertyKey>(
  obj: ReadonlyRecord<K, DurationInput | undefined>,
): PartialReadonlyRecord<K, number> {
  return recordEntries(obj).reduce(
    (acc, [key, val]) => (val === undefined ? acc : { ...acc, [key]: Duration.toSeconds(val) }),
    partialRecordEmpty<K, number>(),
  )
}
