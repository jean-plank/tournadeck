import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import type { DecodeError as IoTsDecodeError } from 'io-ts/lib/Decoder'
import type { AnyNewtype, CarrierOf } from 'newtype-ts'

import { StringUtils } from './StringUtils'

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
  constructor(decoderName: string, value: unknown, error: IoTsDecodeError) {
    super(decodeErrorString(decoderName)(value)(error))
  }
}

export function fromNewtype<N extends AnyNewtype = never>(
  codec: Codec<unknown, CarrierOf<N>, CarrierOf<N>>,
): Codec<unknown, CarrierOf<N>, N> {
  return codec
}
