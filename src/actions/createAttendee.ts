'use server'

import { either } from 'fp-ts'
import { revalidateTag } from 'next/cache'

import { Config } from '../Config'
import { theQuestService } from '../context/context'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { AttendeeCreate } from '../models/attendee/AttendeeCreate'
import type { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { Attendee } from '../models/pocketBase/tables/Attendee'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import { RiotId } from '../models/riot/RiotId'
import type { SummonerShort } from '../models/theQuest/SummonerShort'

const { getFromPbCacheDuration, tags } = Config.constants

// TODO: check tournament isVisible and role is still open

export async function createAttendee(
  tournament: TournamentId,
  formData: FormData,
): Promise<Attendee> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  if (!Permissions.attendees.create(user.role)) {
    throw new AuthError('Forbidden')
  }

  const attendeeCreate = AttendeeCreate.decoder.decode(formData)

  if (either.isLeft(attendeeCreate)) {
    throw Error('BadRequest')
  }

  const adminPb = await adminPocketBase

  const [summoner] = await Promise.all([
    validateRiotId(attendeeCreate.right.riotId),
    validateCount(adminPb, tournament),
  ])

  const attendee = await adminPb.collection('attendees').create({
    ...attendeeCreate.right,
    user: user.id,
    tournament,
    puuid: summoner.puuid,
  })

  revalidateTag(tags.attendees.list)

  return attendee
}

async function validateRiotId(riotId: RiotId): Promise<SummonerShort> {
  const summoner = await theQuestService.getSummonerByRiotId(
    Config.constants.platform,
    riotId,
    true,
  )

  if (summoner === undefined) {
    throw Error(`BadRequest - Summoner not found: ${RiotId.stringify('#')(riotId)}`)
  }

  return summoner
}

async function validateCount(adminPb: MyPocketBase, tournamentId: TournamentId): Promise<void> {
  const [tournament, attendees] = await Promise.all([
    adminPb.collection('tournaments').getOne(tournamentId),
    adminPb.collection('attendees').getFullList<ReadonlyRecord<string, never>>({
      filter: `tournament="${tournamentId}"`,
      fields: 'none',
      next: { revalidate: getFromPbCacheDuration, tags: [tags.attendees.list] },
    }),
  ])

  if (tournament.teamsCount * 5 <= attendees.length) {
    throw Error('BadRequest')
  }
}
