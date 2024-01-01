import type { OverrideProperties } from 'type-fest'

import type { MatchRoundOutput } from '../../../match/MatchRound'
import type { TheQuestMatch } from '../../../theQuest/TheQuestMatch'
import type {
  DateField,
  JsonField,
  NumberField,
  PbBaseModel,
  PbInput,
  PbOutput,
  SingleRelationField,
} from '../../pbModels'
import type { MatchApiDatasOutput } from './MatchApiDatas'
import type { MatchId } from './MatchId'

export type Match = PbOutput<PbMatch>
export type MatchInput = PbInput<PbMatch>

export type PbMatch = PbBaseModel<
  MatchId,
  {
    tournament: SingleRelationField<'tournaments'>
    round: JsonField<MatchRoundOutput>
    bestOf: NumberField
    team1: SingleRelationField<'teams', 'nullable'>
    team2: SingleRelationField<'teams', 'nullable'>
    winner: SingleRelationField<'teams', 'nullable'>
    plannedOn: DateField<'nullable'>
    apiData: JsonField<MatchApiDatasOutput, 'nullable', unknown>
  }
>

export type MatchApiDataDecoded = OverrideProperties<
  Match,
  {
    apiData: ReadonlyArray<Optional<TheQuestMatch>>
  }
>
