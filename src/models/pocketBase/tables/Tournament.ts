import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { TournamentPhase } from '../../TournamentPhase'
import type {
  BoolField,
  DateField,
  NumberField,
  PbBaseModel,
  PbInput,
  PbOutput,
  SingleSelectField,
  TextField,
} from '../pbModels'

export type Tournament = PbOutput<PbTournament>
export type TournamentInput = PbInput<PbTournament>

export type PbTournament = PbBaseModel<
  TournamentId,
  {
    phase: SingleSelectField<TournamentPhase>
    name: TextField
    start: DateField
    end: DateField
    teamsCount: NumberField<'nullable'>
    isVisible: BoolField<'nullable'>
  }
>

type TournamentId = Newtype<{ readonly TournamentId: unique symbol }, string>

const { wrap, unwrap } = iso<TournamentId>()

const TournamentId = immutableAssign(wrap, { unwrap })

export { TournamentId }
