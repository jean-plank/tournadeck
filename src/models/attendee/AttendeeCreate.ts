import { File } from 'buffer'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { nonEmptyStringDecoder } from '../../utils/ioTsUtils'
import { ChampionPool } from '../ChampionPool'
import { LolElo } from '../LolElo'
import { TeamRole } from '../TeamRole'
import { RiotId } from '../riot/RiotId'

type AttendeeCreate = D.TypeOf<typeof decoder>

const stringMaxLength50Decoder = pipe(
  D.string,
  D.map(s => s.trim()),
  D.refine((s): s is string => s.length <= 50, 'StringMaxLength50'),
)

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
      comment: stringMaxLength50Decoder,
      role: TeamRole.decoder,
      championPool: ChampionPool.decoder,
      birthplace: pipe(nonEmptyStringDecoder, D.parse(stringMaxLength50Decoder.decode)),
      avatar: pipe(
        D.id<unknown>(),
        D.parse(i => (i instanceof File ? D.success(i) : D.failure(i, 'File'))),
      ),
    }),
  ),
)

const AttendeeCreate = { decoder }

export { AttendeeCreate }
