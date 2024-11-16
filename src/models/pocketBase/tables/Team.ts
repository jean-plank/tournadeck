import { eq, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'

import { immutableAssign } from '../../../utils/fpTsUtils'
import { fromNewtype } from '../../../utils/ioTsUtils'
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

const codec = fromNewtype<TeamId>(C.string)

const { wrap, unwrap } = iso<TeamId>()

const Eq: eq.Eq<TeamId> = pipe(string.Eq, eq.contramap(unwrap))

const TeamId = immutableAssign(wrap, { unwrap, codec, Eq })

export { TeamId }
