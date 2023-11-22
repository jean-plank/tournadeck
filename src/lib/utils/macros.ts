import type { Decoder } from 'io-ts/Decoder'
import { $$text } from 'ts-macros'

export function $withName<A extends Decoder<unknown, unknown>>(decoder: A): A & { name: string } {
  return { ...decoder, name: $$text!(decoder) }
}

type DecoderT<I, A> = {
  decoder: Decoder<I, A>
}

export function $decoderWithName<A extends DecoderT<unknown, unknown>>(
  cType: A,
): A['decoder'] & { name: string } {
  return { ...cType.decoder, name: $$text!(cType) }
}
