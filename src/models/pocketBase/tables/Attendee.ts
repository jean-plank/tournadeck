import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { ChampionPool } from '../../ChampionPool'
import type { LolElo } from '../../LolElo'
import type { TeamRole } from '../../TeamRole'
import type {
  BoolField,
  NullableField,
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
    riotId: TextField
    user: SingleRelationField<'users'>
    currentElo: SingleSelectField<LolElo>
    role: SingleSelectField<TeamRole>
    championPool: SingleSelectField<ChampionPool>
    birthplace: TextField
    avatar: SingleFileField
    isCaptain: BoolField
    seed: NullableField<TextField>
    price: NullableField<NumberField>
    tournament: SingleRelationField<'tournaments'>
    comment: NullableField<TextField>
  }
>

type AttendeeId = Newtype<{ readonly AttendeeId: unique symbol }, string>

const { wrap, unwrap } = iso<AttendeeId>()

const AttendeeId = immutableAssign(wrap, { unwrap })

export { AttendeeId }
