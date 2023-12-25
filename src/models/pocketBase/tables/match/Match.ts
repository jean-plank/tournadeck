import type { WinnerOrLoserOf } from '../../../WinnerOrLoserOf'
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
    team1ResultsFrom: JsonField<WinnerOrLoserOf, 'nullable'>
    team1: SingleRelationField<'teams', 'nullable'>
    team2ResultsFrom: JsonField<WinnerOrLoserOf, 'nullable'>
    team2: SingleRelationField<'teams', 'nullable'>
    plannedOn: DateField<'nullable'>
    apiData: JsonField<MatchApiDataOutput, 'nullable'>
  }
>
