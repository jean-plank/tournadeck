import { either, json } from 'fp-ts'
import { identity, pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import type { DecodeError, Decoder } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'
import type { Encoder } from 'io-ts/Encoder'
import type { AnyNewtype, CarrierOf } from 'newtype-ts'

import { DayjsDuration } from '../models/Dayjs'
import { ellipse } from './stringUtils'

const limit = 10000

export const decodeErrorString =
  (name: string) =>
  (value: unknown) =>
  (error: DecodeError): string =>
    `Couldn't decode ${name}:\nError:\n${pipe(D.draw(error), ellipse(limit))}\n\nValue: ${pipe(
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
 * DateFromISOString
 */

const dateFromISOStringDecoder: Decoder<unknown, Date> = pipe(
  D.string,
  D.parse(str => {
    const d = new Date(str)
    return !isNaN(d.getTime()) ? D.success(d) : D.failure(str, 'DateFromISOString')
  }),
)

const dateFromISOStringEncoder: Encoder<string, Date> = {
  encode: d => d.toISOString(),
}

const dateFromISOStringCodec: Codec<unknown, string, Date> = C.make(
  dateFromISOStringDecoder,
  dateFromISOStringEncoder,
)

export const DateFromISOString = {
  decoder: dateFromISOStringDecoder,
  encoder: dateFromISOStringEncoder,
  codec: dateFromISOStringCodec,
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

/**
 * URLFromString
 */

const urlFromStringDecoder: Decoder<unknown, URL> = pipe(
  D.string,
  D.parse(str => {
    try {
      return D.success(new URL(str))
    } catch {
      return D.failure(str, 'URLFromString')
    }
  }),
)

export const URLFromString = {
  decoder: urlFromStringDecoder,
}
