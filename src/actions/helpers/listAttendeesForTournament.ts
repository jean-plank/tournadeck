'use server'

import { Config } from '../../config/Config'
import { constants } from '../../config/constants'
import { getLogger, theQuestService } from '../../context/context'
import type { AttendeeWithRiotId } from '../../models/attendee/AttendeeWithRiotId'
import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { TournamentId } from '../../models/pocketBase/tables/Tournament'
import { GameName } from '../../models/riot/GameName'
import { RiotId } from '../../models/riot/RiotId'
import { TagLine } from '../../models/riot/TagLine'

const { getFromPbCacheDuration, tags } = Config.constants

const logger = getLogger('listAttendeesForTournament')

export async function listAttendeesForTournament(
  adminPb: MyPocketBase,
  tournamentId: TournamentId,
): Promise<ReadonlyArray<AttendeeWithRiotId>> {
  const attendees = await adminPb.collection('attendees').getFullList({
    filter: adminPb.smartFilter<'attendees'>({ tournament: tournamentId }),
    next: { revalidate: getFromPbCacheDuration, tags: [tags.attendees] },
  })

  return Promise.all(
    attendees.map(
      (a): Promise<AttendeeWithRiotId> =>
        theQuestService.getSummonerByPuuid(constants.platform, a.puuid, true).then(summoner => {
          if (summoner === undefined) {
            logger.warn(`Summoner not found for attendee ${a.id}`)
          }

          return {
            ...a,
            riotId: summoner?.riotId ?? RiotId(GameName('undefined'), TagLine('undef')),
          }
        }),
    ),
  )
}
