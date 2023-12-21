import type { Json } from 'fp-ts/Json'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
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
    team1: SingleRelationField<'teams'>
    team2: SingleRelationField<'teams'>
    plannedOn: NullableField<DateField>
    apiData: NullableField<JsonField<Json>>
  }
>

type MatchId = Newtype<{ readonly MatchId: unique symbol }, string>

const { wrap, unwrap } = iso<MatchId>()

const MatchId = immutableAssign(wrap, { unwrap })

export { MatchId }
