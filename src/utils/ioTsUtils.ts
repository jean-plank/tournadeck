import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import type { DecodeError } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'

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
