import { File } from 'buffer'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { ChampionPool } from '../ChampionPool'
import { LolElo } from '../LolElo'
import { TeamRole } from '../TeamRole'
import { RiotId } from '../riot/RiotId'

type AttendeeCreate = D.TypeOf<typeof decoder>

const decoder = pipe(
  D.id<FormData>(),
  D.map(formData => {
    const data: Record<string, FormDataEntryValue> = {}

    formData.forEach((val, key) => (data[key] = val))

    return data
  }),
  D.compose(
    D.struct({
      riotId: RiotId.fromStringDecoder('#'),
      currentElo: LolElo.decoder,
      comment: pipe(
        D.string,
        D.refine((s): s is string => s.trim().length <= 50, 'StringMaxLength50'),
      ),
      role: TeamRole.decoder,
      championPool: ChampionPool.decoder,
      birthplace: pipe(
        D.string,
        D.refine((s): s is string => 0 < s.trim().length, 'NonEmptyString'),
      ),
      avatar: pipe(
        D.id<unknown>(),
        D.parse(i => (i instanceof File ? D.success(i) : D.failure(i, 'File'))),
      ),
    }),
  ),
)

const AttendeeCreate = { decoder }

export { AttendeeCreate }
