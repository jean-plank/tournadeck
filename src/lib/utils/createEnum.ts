import { eq, number, option, ord, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import type { Decoder } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'
import type { Encoder } from 'io-ts/Encoder'
import * as E from 'io-ts/Encoder'
import type { Literal } from 'io-ts/Schemable'

type Enum<A extends NonEmptyArray<Literal>> = {
  values: A
  decoder: Decoder<unknown, A[number]>
  encoder: Encoder<A[number], A[number]>
  codec: Codec<unknown, A[number], A[number]>
  Eq: eq.Eq<A[number]>
  Ord: ord.Ord<A[number]>
  T: A[number]
}

export function createEnum<A extends NonEmptyArray<Literal>>(...values: A): Enum<A> {
  const [head, ...tail] = values
  const decoder = D.literal(head, ...tail)
  const encoder = E.id<A[number]>()
  const codec = C.make(decoder, encoder)
  const Eq: eq.Eq<A[number]> = eq.eqStrict
  const Ord: ord.Ord<A[number]> = pipe(
    number.Ord,
    ord.contramap((value: A[number]) =>
      pipe(
        values,
        readonlyArray.findIndex(v => Eq.equals(v, value)),
        option.getOrElse(() => Infinity),
      ),
    ),
  )

  const res: Omit<Enum<A>, 'T'> = { values, decoder, encoder, codec, Eq, Ord }
  return res as Enum<A>
}
