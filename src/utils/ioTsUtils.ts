import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { Codec } from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import { DecodeError as IoTsDecodeError } from 'io-ts/lib/Decoder'
import { AnyNewtype, CarrierOf } from 'newtype-ts'

import { StringUtils } from '@/utils/StringUtils'

const limit = 10000

export const decodeErrorString =
  (name: string) =>
  (value: unknown) =>
  (error: IoTsDecodeError): string =>
    StringUtils.stripMargins(
      `Couldn't decode ${name}:
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
  (name: string) =>
  (value: unknown) =>
  (error: IoTsDecodeError): DecodeError =>
    new DecodeError(name, value, error)

export class DecodeError extends Error {
  constructor(name: string, value: unknown, error: IoTsDecodeError) {
    super(decodeErrorString(name)(value)(error))
  }
}

export function fromNewtype<N extends AnyNewtype = never>(
  codec: Codec<unknown, CarrierOf<N>, CarrierOf<N>>,
): Codec<unknown, CarrierOf<N>, N> {
  return codec
}
