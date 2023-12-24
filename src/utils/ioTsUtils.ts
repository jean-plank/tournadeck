import { either, json } from 'fp-ts'
import { identity, pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import type { DecodeError, Decoder } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'
import type { Encoder } from 'io-ts/Encoder'
import type { AnyNewtype, CarrierOf } from 'newtype-ts'

import { Dayjs, DayjsDuration } from '../models/Dayjs'
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

/**
 * readonly
 */

export const fromReadonlyArrayDecoder = D.fromArray as unknown as <I, A>(
  item: Decoder<I, A>,
) => Decoder<ReadonlyArray<I>, ReadonlyArray<A>>

/**
 * DayjsFromISOString
 */

const dayjsFromISOStringDecoder: Decoder<unknown, Dayjs> = pipe(
  D.string,
  D.parse(str => {
    const d = Dayjs(str)
    return d.isValid() ? D.success(d) : D.failure(str, 'DayjsFromISOString')
  }),
)

const dayjsFromISOStringEncoder: Encoder<string, Dayjs> = {
  encode: d => d.toISOString(),
}

const dayjsFromISOStringCodec: Codec<unknown, string, Dayjs> = C.make(
  dayjsFromISOStringDecoder,
  dayjsFromISOStringEncoder,
)

export const DayjsFromISOString = {
  decoder: dayjsFromISOStringDecoder,
  encoder: dayjsFromISOStringEncoder,
  codec: dayjsFromISOStringCodec,
}

/**
 * DayjsDurationFromNumber
 */

const dayjsDurationFromNumberDecoder: Decoder<unknown, DayjsDuration> = pipe(
  D.number,
  D.map(n => DayjsDuration(n)),
)

const dayjsDurationFromNumberEncoder: Encoder<number, DayjsDuration> = {
  encode: d => d.asMilliseconds(),
}

const dayjsDurationFromNumberCodec: Codec<unknown, number, DayjsDuration> = C.make(
  dayjsDurationFromNumberDecoder,
  dayjsDurationFromNumberEncoder,
)

export const DayjsDurationFromNumber = {
  decoder: dayjsDurationFromNumberDecoder,
  encoder: dayjsDurationFromNumberEncoder,
  codec: dayjsDurationFromNumberCodec,
}
