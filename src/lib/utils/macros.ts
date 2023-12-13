import type { Codec } from 'io-ts/Codec'
import type { Decoder } from 'io-ts/Decoder'
import type { RawContext } from 'ts-macros'
import { $$err, $$raw, $$text } from 'ts-macros'
import type ts from 'typescript'

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

export function $decoderWithName<I, A>(cType: DecoderT<I, A>): Decoder<I, A> & { name: string } {
  return { ...cType.decoder, name: $text!(cType) }
}

type CodecT<I, O, A> = {
  codec: Codec<I, O, A>
}

export function $codecWithName<I, O, A>(cType: CodecT<I, O, A>): Codec<I, O, A> & { name: string } {
  return { ...cType.codec, name: $text!(cType) }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function $filenameAndFunction(exp: unknown): string {
  return $$raw!((ctx: RawContext, expNode: ts.Node) => {
    if (!('escapedText' in expNode)) {
      throw Error("'escapedText' is not in expNode")
    }

    const expFileName = getFileName(expNode.getSourceFile().fileName)
    const expName = expNode.escapedText

    return ctx.factory.createStringLiteral(`${expFileName}#${expName}`)
  })
}

function getFileName(absPath: string): string {
  const cwd = process.cwd() // /path/to/tournadeck

  const relPath = dropStartString(absPath, `${cwd}/src/`)

  return withoutExtension(relPath)
}

function dropStartString(str: string, searchString: string): string {
  if (!str.startsWith(searchString)) {
    throw Error(`${str} should start with ${searchString}`)
  }
  return str.slice(searchString.length)
}

function withoutExtension(str: string): string {
  const [base, ...tail] = str.split('.')

  return [base, ...tail.slice(0, -1)].join('.')
}
