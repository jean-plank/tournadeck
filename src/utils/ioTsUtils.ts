import { either, json, option } from 'fp-ts'
import type { Either } from 'fp-ts/Either'
import type { Option } from 'fp-ts/Option'
import { flow, identity, pipe } from 'fp-ts/function'
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
 * Option
 */

function optionDecoder<I, A>(decoder: Decoder<I, A>): Decoder<I | null | undefined, Option<A>> {
  return {
    decode: u =>
      u === null || u === undefined
        ? D.success(option.none)
        : pipe(decoder.decode(u), either.map(option.some)),
  }
}

function optionEncoder<O, A>(encoder: Encoder<O, A>): Encoder<O | null, Option<A>> {
  return {
    encode: flow(option.map(encoder.encode), option.toNullable),
  }
}

export function optionCodec<O, A>(
  codec: Codec<unknown, O, A>,
): Codec<unknown, O | null, Option<A>> {
  return C.make(optionDecoder(codec), optionEncoder(codec))
}

/**
 * Either
 */

function eitherDecoder<E, A>(
  left: Decoder<unknown, E>,
  right: Decoder<unknown, A>,
): Decoder<unknown, Either<E, A>> {
  return D.sum('_tag')({
    Left: D.struct({ _tag: D.literal('Left'), left }),
    Right: D.struct({ _tag: D.literal('Right'), right }),
  })
}

function eitherEncoder<OE, E, OA, A>(
  left: Encoder<OE, E>,
  right: Encoder<OA, A>,
): Encoder<Either<OE, OA>, Either<E, A>> {
  return {
    encode: either.bimap(left.encode, right.encode),
  }
}

export function eitherCodec<OE, E, OA, A>(
  left: Codec<unknown, OE, E>,
  right: Codec<unknown, OA, A>,
): Codec<unknown, Either<OE, OA>, Either<E, A>> {
  return C.make(eitherDecoder(left, right), eitherEncoder(left, right))
}

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
 * DateFromNumber
 */

const dateFromNumberNumberDecoder: Decoder<number, Date> = {
  decode: n => {
    const d = new Date(n)
    return !isNaN(d.getTime()) ? D.success(d) : D.failure(n, 'DateFromNumber')
  },
}

const dateFromNumberDecoder: Decoder<unknown, Date> = pipe(
  D.number,
  D.compose(dateFromNumberNumberDecoder),
)

export const DateFromNumber = {
  decoder: dateFromNumberDecoder,
  numberDecoder: dateFromNumberNumberDecoder,
}

/**
 * DayjsDurationFromNumber
 */

const dayjsDurationFromNumberNumberDecoder: Decoder<number, DayjsDuration> = {
  decode: n => D.success(DayjsDuration(n)),
}

const dayjsDurationFromNumberDecoder: Decoder<unknown, DayjsDuration> = pipe(
  D.number,
  D.compose(dayjsDurationFromNumberNumberDecoder),
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
  numberDecoder: dayjsDurationFromNumberNumberDecoder,
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

/**
 * NonEmptyString
 */

export const nonEmptyStringDecoder = pipe(
  D.string,
  D.map(s => s.trim()),
  D.refine((s): s is string => 0 < s.length, 'NonEmptyString'),
)
