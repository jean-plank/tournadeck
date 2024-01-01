import type { OverrideProperties } from 'type-fest'

import type { WinnerOrLoserOf, WinnerOrLoserOfOutput } from '../../../WinnerOrLoserOf'
import type { TheQuestMatch } from '../../../theQuest/TheQuestMatch'
import type {
  DateField,
  JsonField,
  PbBaseModel,
  PbInput,
  PbOutput,
  SingleRelationField,
} from '../../pbModels'
import type { MatchApiDataOutput } from './MatchApiData'
import type { MatchId } from './MatchId'

export type Match = PbOutput<PbMatch>
export type MatchInput = PbInput<PbMatch>

export type PbMatch = PbBaseModel<
  MatchId,
  {
    tournament: SingleRelationField<'tournaments'>
    team1ResultsFrom: JsonField<WinnerOrLoserOfOutput, 'nullable'>
    team1: SingleRelationField<'teams', 'nullable'>
    team2ResultsFrom: JsonField<WinnerOrLoserOfOutput, 'nullable'>
    team2: SingleRelationField<'teams', 'nullable'>
    plannedOn: DateField<'nullable'>
    apiData: JsonField<MatchApiDataOutput, 'nullable'>
  }
>

export type MatchResultsFromDecoded = OverrideProperties<
  Match,
  {
    team1ResultsFrom: Optional<WinnerOrLoserOf>
    team2ResultsFrom: Optional<WinnerOrLoserOf>
  }
>

export type MatchApiDataDecoded = OverrideProperties<
  Match,
  {
    apiData: Optional<TheQuestMatch>
  }
>
