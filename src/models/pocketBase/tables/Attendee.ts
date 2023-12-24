import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { ChampionPool } from '../../ChampionPool'
import type { LolElo } from '../../LolElo'
import type { TeamRole } from '../../TeamRole'
import type { Puuid } from '../../riot/Puuid'
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
    user: SingleRelationField<'users'>
    tournament: SingleRelationField<'tournaments'>
    puuid: TextField<Puuid>
    currentElo: SingleSelectField<LolElo>
    comment: NullableField<TextField>
    role: SingleSelectField<TeamRole>
    championPool: SingleSelectField<ChampionPool>
    birthplace: TextField
    avatar: SingleFileField
    isCaptain: NullableField<BoolField>
    seed: NullableField<TextField>
    price: NullableField<NumberField>
  }
>

type AttendeeId = Newtype<{ readonly AttendeeId: unique symbol }, string>

const { wrap, unwrap } = iso<AttendeeId>()

const AttendeeId = immutableAssign(wrap, { unwrap })

export { AttendeeId }
