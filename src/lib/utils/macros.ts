import type { Decoder } from 'io-ts/Decoder'
import { $$err, $$text } from 'ts-macros'

export function $$textSafe(exp: unknown): string {
  const $res = $$text!(exp)

  if ($res === 'null') {
    $$err!(`$$text: exp in not transformable.`)
  }

  return $res
}

export function $withName<A extends Decoder<unknown, unknown>>(decoder: A): A & { name: string } {
  return { ...decoder, name: $$textSafe!(decoder) }
}

type DecoderT<I, A> = {
  decoder: Decoder<I, A>
}

export function $decoderWithName<A extends DecoderT<unknown, unknown>>(
  cType: A,
): A['decoder'] & { name: string } {
  return { ...cType.decoder, name: $$textSafe!(cType) }
}
