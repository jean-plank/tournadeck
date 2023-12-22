import { either, json } from 'fp-ts'
import { identity, pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import type { DecodeError } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'
import type { AnyNewtype, CarrierOf } from 'newtype-ts'

import { ellipse } from './stringUtils'

const limit = 10000

export const decodeErrorString =
  (name: string) =>
  (value: unknown) =>
  (error: DecodeError): string =>
    `Couldn't decode ${name}:\bError:\n${pipe(D.draw(error), ellipse(limit))}
      |
      |Value: ${pipe(
        json.stringify(value),
        either.getOrElse(() => `${value}`),
        ellipse(limit),
      )}`

export const decodeError =
  (name: string) =>
  (value: unknown) =>
  (error: DecodeError): Error =>
    Error(decodeErrorString(name)(value)(error))

export const fromNewtype: <N extends AnyNewtype = never>(
  codec: Codec<unknown, CarrierOf<N>, CarrierOf<N>>,
) => Codec<unknown, CarrierOf<N>, N> = identity
