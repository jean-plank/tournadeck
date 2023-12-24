import type { WinnerOrLoserOf } from '../../../WinnerOrLoserOf'
import type { GameId } from '../../../riot/GameId'
import type { TheQuestMatchOutput } from '../../../theQuest/TheQuestMatch'
import type {
  DateField,
  JsonField,
  NullableField,
  PbBaseModel,
  PbInput,
  PbOutput,
  SingleRelationField,
} from '../../pbModels'
import type { MatchId } from './MatchId'

export type Match = PbOutput<PbMatch>
export type MatchInput = PbInput<PbMatch>

export type PbMatch = PbBaseModel<
  MatchId,
  {
    team1ResultsFrom: NullableField<JsonField<WinnerOrLoserOf>>
    team1: NullableField<SingleRelationField<'teams'>>
    team2ResultsFrom: NullableField<JsonField<WinnerOrLoserOf>>
    team2: NullableField<SingleRelationField<'teams'>>
    plannedOn: NullableField<DateField>
    apiData: NullableField<JsonField<GameId | TheQuestMatchOutput>>
  }
>
