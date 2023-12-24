'use server'

import { either } from 'fp-ts'

import { Config } from '../Config'
import { adminPocketBase, getLogger, theQuestService } from '../context'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AttendeeCreate } from '../models/attendee/AttendeeCreate'
import type { AttendeeWithRiotId } from '../models/attendee/AttendeeWithRiotId'
import type { Attendee } from '../models/pocketBase/tables/Attendee'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import { GameName } from '../models/riot/GameName'
import { RiotId } from '../models/riot/RiotId'
import { TagLine } from '../models/riot/TagLine'

const logger = getLogger('attendeesActions')

// for GET actions
const cacheDuration = 5 // seconds

export async function listAttendeesForTournament(
  tournamentId: TournamentId,
): Promise<ReadonlyArray<AttendeeWithRiotId>> {
  const { user } = await auth()

  if (!Permissions.attendees.list(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  const attendees = await adminPb.collection('attendees').getFullList<Attendee>({
    filter: `tournament="${tournamentId}"`,
    next: { revalidate: cacheDuration },
  })

  return Promise.all(
    attendees.map(
      (a): Promise<AttendeeWithRiotId> =>
        theQuestService.getSummonerByPuuid(Config.constants.platform, a.puuid).then(summoner => {
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

export async function createAttendee(
  tournament: TournamentId,
  formData: FormData,
): Promise<Attendee> {
  const { user } = await auth()

  if (!Permissions.attendees.list(user.role)) {
    throw Error('Forbidden')
  }

  const attendee = AttendeeCreate.decoder.decode(formData)

  if (either.isLeft(attendee)) {
    throw Error('BadRequest')
  }

  const { riotId } = attendee.right

  const summoner = await theQuestService.getSummonerByRiotId(Config.constants.platform, riotId)

  if (summoner === undefined) {
    throw Error(`BadRequest - Summoner not found: ${RiotId.stringify('#')(riotId)}`)
  }

  const adminPb = await adminPocketBase

  return await adminPb.collection('attendees').create({
    ...attendee.right,
    user: user.id,
    tournament,
    puuid: summoner.puuid,
  })
}
