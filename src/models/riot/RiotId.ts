import { eq } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import type { Decoder } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'
import type { Encoder } from 'io-ts/Encoder'
import * as E from 'io-ts/Encoder'

import { immutableAssign } from '../../utils/fpTsUtils'
import { GameName } from './GameName'
import { TagLine } from './TagLine'

type RiotId = {
  gameName: GameName
  tagLine: TagLine
}

function construct(gameName: GameName, tagLine: TagLine): RiotId {
  return { gameName, tagLine }
}

type Sep = '#' | '-'

// {3-16}#{3-5}
function getRegex(sep: Sep): RegExp {
  return RegExp(`^(.+)${sep}([^${sep}]+)$`)
}

function fromStringDecoder(sep: Sep): Decoder<unknown, RiotId> {
  const regex = getRegex(sep)

  return pipe(
    D.string,
    D.parse(str => {
      const match = str.match(regex)

      if (match === null) return D.failure(str, `RiotId[${sep}]`)

      const [, gameName, tagLine] = match

      return D.success(construct(GameName(gameName), TagLine(tagLine)))
    }),
  )
}

const stringify =
  (sep: Sep) =>
  ({ gameName, tagLine }: RiotId): string =>
    `${gameName}${sep}${tagLine}`

function fromStringEncoder(sep: Sep): Encoder<string, RiotId> {
  return pipe(E.id<string>(), E.contramap(stringify(sep)))
}

function fromStringCodec(sep: Sep): Codec<unknown, string, RiotId> {
  return C.make(fromStringDecoder(sep), fromStringEncoder(sep))
}

const Eq: eq.Eq<RiotId> = eq.struct({
  gameName: GameName.Eq,
  tagLine: TagLine.Eq,
})

const RiotId = immutableAssign(construct, {
  fromStringDecoder,
  fromStringEncoder,
  fromStringCodec,
  stringify,
  Eq,
})

export { RiotId }
