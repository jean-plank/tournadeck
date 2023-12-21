import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type {
  DateField,
  NullableField,
  NumberField,
  PbBaseModel,
  PbInput,
  PbOutput,
  TextField,
} from '../pbModels'

export type Tournament = PbOutput<PbTournament>
export type TournamentInput = PbInput<PbTournament>

export type PbTournament = PbBaseModel<
  TournamentId,
  {
    name: TextField
    start: DateField
    end: DateField
    teamsCount: NullableField<NumberField>
  }
>

type TournamentId = Newtype<{ readonly TournamentId: unique symbol }, string>

const { wrap, unwrap } = iso<TournamentId>()

const TournamentId = immutableAssign(wrap, { unwrap })

export { TournamentId }
