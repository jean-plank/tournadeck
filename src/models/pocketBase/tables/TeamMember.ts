import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { PbBaseModel, PbInput, PbOutput, SingleRelationField } from '../pbModels'

export type TeamMember = PbOutput<PbTeamMember>
export type TeamMemberInput = PbInput<PbTeamMember>

export type PbTeamMember = PbBaseModel<
  TeamMemberId,
  {
    team: SingleRelationField<'teams'>
    attendee: SingleRelationField<'attendees'>
  }
>

type TeamMemberId = Newtype<{ readonly TeamMemberId: unique symbol }, string>

const { wrap, unwrap } = iso<TeamMemberId>()

const TeamMemberId = immutableAssign(wrap, { unwrap })

export { TeamMemberId }
