import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import type { PbBaseModel, PbInput, PbOutput, SingleRelationField, TextField } from '../pbModels'

export type Team = PbOutput<PbTeam>
export type TeamInput = PbInput<PbTeam>

export type PbTeam = PbBaseModel<
  TeamId,
  {
    tournament: SingleRelationField<'tournaments'>
    name: TextField
    tag: TextField
  }
>

type TeamId = Newtype<{ readonly TeamId: unique symbol }, string>

const { wrap, unwrap } = iso<TeamId>()

const TeamId = immutableAssign(wrap, { unwrap })

export { TeamId }
