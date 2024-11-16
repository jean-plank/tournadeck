import { number, ord } from 'fp-ts'
import type { Ord } from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import { fromNewtype } from '../../../utils/ioTsUtils'
import type { ChampionPool } from '../../ChampionPool'
import type { LolElo } from '../../LolElo'
import { TeamRole } from '../../TeamRole'
import type { Puuid } from '../../riot/Puuid'
import type {
  BoolField,
  NumberField,
  PbBaseModel,
  PbInput,
  PbOutput,
  SingleFileField,
  SingleRelationField,
  SingleSelectField,
  TextField,
} from '../pbModels'

export type Attendee = PbOutput<PbAttendee>
export type AttendeeInput = PbInput<PbAttendee>

export type PbAttendee = PbBaseModel<
  AttendeeId,
  {
    user: SingleRelationField<'users'>
    tournament: SingleRelationField<'tournaments'>
    puuid: TextField<Puuid>
    currentElo: SingleSelectField<LolElo>
    comment: TextField<string, 'nullable'>
    team: SingleRelationField<'teams', 'nullable'>
    role: SingleSelectField<TeamRole>
    championPool: SingleSelectField<ChampionPool>
    birthplace: TextField
    avatar: SingleFileField
    isCaptain: BoolField<'nullable'>
    seed: NumberField<'nullable'>
    avatarRating: NumberField<'nullable'>
    price: NumberField<'nullable'>
  }
>

const byRole: Ord<Attendee> = pipe(
  TeamRole.Ord,
  ord.contramap((a: Attendee) => a.role),
)

const bySeed: Ord<Attendee> = pipe(
  number.Ord,
  ord.contramap((a: Attendee) => (a.seed === 0 ? Infinity : a.seed)),
)

export const Attendee = { byRole, bySeed }

type AttendeeId = Newtype<{ readonly AttendeeId: unique symbol }, string>

const codec = fromNewtype<AttendeeId>(C.string)

const { wrap, unwrap } = iso<AttendeeId>()

const AttendeeId = immutableAssign(wrap, { unwrap, codec })

export { AttendeeId }
