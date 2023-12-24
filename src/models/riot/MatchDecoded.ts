import type { OverrideProperties } from 'type-fest'

import type { Match } from '../pocketBase/tables/match/Match'
import type { TheQuestMatch } from '../theQuest/TheQuestMatch'

export type MatchDecoded = OverrideProperties<
  Match,
  {
    apiData: TheQuestMatch | null
  }
>
