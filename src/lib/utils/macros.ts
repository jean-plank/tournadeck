import type { Decoder } from 'io-ts/Decoder'
import { $$err, $$text } from 'ts-macros'

/**
 * $$text, but safe.
 */
export function $text(exp: unknown): string {
  const $res = $$text!(exp)

  if ($res === 'null') {
    $$err!(`$$text: exp in not transformable.`)
  }

  return $res
}

export function $withName<A extends Decoder<unknown, unknown>>(a: A): A & { name: string } {
  return { ...a, name: $text!(a) }
}

type DecoderT<I, A> = {
  decoder: Decoder<I, A>
}

export function $decoderWithName<A extends DecoderT<unknown, unknown>>(
  cType: A,
): A['decoder'] & { name: string } {
  return { ...cType.decoder, name: $text!(cType) }
}
