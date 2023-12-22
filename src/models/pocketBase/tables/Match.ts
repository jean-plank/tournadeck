import { eq, string } from 'fp-ts'
import type { Json } from 'fp-ts/Json'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import { fromNewtype } from '../../../utils/ioTsUtils'
import type { WinnerOrLoserOf } from '../../WinnerOrLoserOf'
import type {
  DateField,
  JsonField,
  NullableField,
  PbBaseModel,
  PbInput,
  PbOutput,
  SingleRelationField,
} from '../pbModels'

export type Match = PbOutput<PbMatch>
export type MatchInput = PbInput<PbMatch>

export type PbMatch = PbBaseModel<
  MatchId,
  {
    team1ResultsFrom: NullableField<JsonField<WinnerOrLoserOf>>
    team1: NullableField<SingleRelationField<'teams'>>
    team2ResultsFrom: NullableField<JsonField<WinnerOrLoserOf>>
    team2: NullableField<SingleRelationField<'teams'>>
    plannedOn: NullableField<DateField>
    apiData: NullableField<JsonField<Json>>
  }
>

type MatchId = Newtype<{ readonly MatchId: unique symbol }, string>

const { wrap, unwrap } = iso<MatchId>()

const codec = fromNewtype<MatchId>(C.string)

const Eq: eq.Eq<MatchId> = pipe(string.Eq, eq.contramap(unwrap))

const MatchId = immutableAssign(wrap, { unwrap, codec, Eq })

export { MatchId }
