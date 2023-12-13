import type { Codec } from 'io-ts/Codec'
import type { Decoder } from 'io-ts/Decoder'

export type DecoderWithName<I, A> = Decoder<I, A> & {
  name: string
}

export type CodecWithName<I, O, A> = Codec<I, O, A> & {
  name: string
}
