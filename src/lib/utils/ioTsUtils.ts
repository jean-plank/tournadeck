import { flow } from 'effect'
import {
  either,
  json,
  option,
  predicate,
  readonlyArray,
  readonlyNonEmptyArray,
  string,
} from 'fp-ts'
import type { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray'
import { pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import type { Decoder } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'
import type { Encoder } from 'io-ts/Encoder'
import type { DecodeError as IoTsDecodeError } from 'io-ts/lib/Decoder'
import type { AnyNewtype, CarrierOf } from 'newtype-ts'

import { DayJs } from '../models/DayJs'
import { StringUtils } from './StringUtils'
import { arrayMkString } from './fp'

const limit = 10000

export const decodeErrorString =
  (decoderName: string) =>
  (value: unknown) =>
  (error: IoTsDecodeError): string =>
    StringUtils.stripMargins(
      `Couldn't decode ${decoderName}:
      |Error:
      |${pipe(D.draw(error), StringUtils.ellipse(limit))}
      |
      |Value: ${pipe(
        json.stringify(value),
        either.getOrElse(() => `${value}`),
        StringUtils.ellipse(limit),
      )}`,
    )

export const decodeError =
  (decoderName: string) =>
  (value: unknown) =>
  (error: IoTsDecodeError): DecodeError =>
    new DecodeError(decoderName, value, error)

export class DecodeError extends Error {
  constructor(
    public decoderName: string,
    public value: unknown,
    public error: IoTsDecodeError,
  ) {
    super(decodeErrorString(decoderName)(value)(error))
  }
}

export function fromNewtype<N extends AnyNewtype = never>(
  codec: Codec<unknown, CarrierOf<N>, CarrierOf<N>>,
): Codec<unknown, CarrierOf<N>, N> {
  return codec
}

/**
 * NonEmptyArray
 */

function nonEmptyArrayDecoder<A>(
  decoder: Decoder<unknown, A>,
): Decoder<unknown, ReadonlyNonEmptyArray<A>> {
  return pipe(
    D.array(decoder),
    D.refine<ReadonlyArray<A>, ReadonlyNonEmptyArray<A>>(readonlyArray.isNonEmpty, 'NonEmptyArray'),
  )
}

function nonEmptyArrayEncoder<O, A>(
  encoder: Encoder<O, A>,
): Encoder<ReadonlyNonEmptyArray<O>, ReadonlyNonEmptyArray<A>> {
  return {
    encode: readonlyNonEmptyArray.map(encoder.encode),
  }
}

function nonEmptyArrayCodec<O, A>(
  codec: Codec<unknown, O, A>,
): Codec<unknown, ReadonlyNonEmptyArray<O>, ReadonlyNonEmptyArray<A>> {
  return C.make(nonEmptyArrayDecoder(codec), nonEmptyArrayEncoder(codec))
}

export const NonEmptyArray = {
  decoder: nonEmptyArrayDecoder,
  encoder: nonEmptyArrayEncoder,
  codec: nonEmptyArrayCodec,
}

/**
 * ArrayFromString
 */

function prepareArray(separator: string): (i: string) => ReadonlyArray<string> {
  return flow(
    string.split(separator),
    readonlyNonEmptyArray.map(string.trim),
    readonlyArray.filter(predicate.not(string.isEmpty)),
  )
}

const arrayFromStringDecoder =
  (separator: string) =>
  <A>(decoder: Decoder<unknown, A>): Decoder<unknown, ReadonlyArray<A>> =>
    pipe(D.string, D.map(prepareArray(separator)), D.compose(D.array(decoder)))

const arrayFromStringEncoder =
  (separator: string) =>
  <A>(encoder: Encoder<string, A>): Encoder<string, ReadonlyArray<A>> => ({
    encode: flow(readonlyArray.map(encoder.encode), arrayMkString(separator)),
  })

const arrayFromStringCodec =
  (separator: string) =>
  <A>(codec: Codec<unknown, string, A>): Codec<unknown, string, ReadonlyArray<A>> =>
    C.make(arrayFromStringDecoder(separator)(codec), arrayFromStringEncoder(separator)(codec))

export const ArrayFromString = {
  decoder: arrayFromStringDecoder,
  encoder: arrayFromStringEncoder,
  codec: arrayFromStringCodec,
}

/**
 * NonEmptyArrayFromString
 */

const nonEmptyArrayFromStringDecoder =
  (separator: string) =>
  <A>(decoder: Decoder<unknown, A>): Decoder<unknown, ReadonlyNonEmptyArray<A>> =>
    pipe(D.string, D.map(prepareArray(separator)), D.compose(NonEmptyArray.decoder(decoder)))

const nonEmptyArrayFromStringEncoder: (
  separator: string,
) => <A>(encoder: Encoder<string, A>) => Encoder<string, ReadonlyNonEmptyArray<A>> =
  arrayFromStringEncoder

const nonEmptyArrayFromStringCodec =
  (separator: string) =>
  <A>(codec: Codec<unknown, string, A>): Codec<unknown, string, ReadonlyNonEmptyArray<A>> =>
    C.make(
      nonEmptyArrayFromStringDecoder(separator)(codec),
      nonEmptyArrayFromStringEncoder(separator)(codec),
    )

export const NonEmptyArrayFromString = {
  decoder: nonEmptyArrayFromStringDecoder,
  encoder: nonEmptyArrayFromStringEncoder,
  codec: nonEmptyArrayFromStringCodec,
}

/**
 * DayJsFromDate
 */

const dayJsFromDateDecoder: Decoder<unknown, DayJs> = {
  decode: i =>
    pipe(
      i,
      option.fromPredicate((u): u is Date => u instanceof Date),
      option.map(d => DayJs.of(d)),
      option.filter(DayJs.isValid),
      option.fold(() => D.failure(i, 'DayJsFromDate'), D.success),
    ),
}

const dayJsFromDateEncoder: Encoder<Date, DayJs> = { encode: DayJs.toDate }

const dayJsFromDateCodec: Codec<unknown, Date, DayJs> = C.make(
  dayJsFromDateDecoder,
  dayJsFromDateEncoder,
)

export const DayJsFromDate = {
  decoder: dayJsFromDateDecoder,
  encoder: dayJsFromDateEncoder,
  codec: dayJsFromDateCodec,
}
