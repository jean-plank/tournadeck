import { ord, string } from 'fp-ts'
import type { Ord } from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import { fromNewtype } from '../../../utils/ioTsUtils'
import type { TournamentPhase } from '../../TournamentPhase'
import type { ChampionId } from '../../riot/ChampionId'
import type {
  BoolField,
  DateField,
  JsonField,
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
    teamsCount: NumberField<number, 'nullable'>
    isVisible: BoolField<'nullable'>
    bannedChampions: JsonField<ReadonlyArray<ChampionId>, 'nullable'>
  }
>

const byStart: Ord<Tournament> = pipe(
  string.Ord,
  ord.contramap((t: Tournament) => t.start),
)

export const Tournament = { byStart }

type TournamentId = Newtype<{ readonly TournamentId: unique symbol }, string>

const codec = fromNewtype<TournamentId>(C.string)

const { wrap, unwrap } = iso<TournamentId>()

const TournamentId = immutableAssign(wrap, { unwrap, codec })

export { TournamentId }
