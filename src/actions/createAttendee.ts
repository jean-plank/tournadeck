'use server'

import { either } from 'fp-ts'
import { revalidateTag } from 'next/cache'

import { Config } from '../Config'
import { adminPocketBase, theQuestService } from '../context'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { AttendeeCreate } from '../models/attendee/AttendeeCreate'
import type { Attendee } from '../models/pocketBase/tables/Attendee'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import { RiotId } from '../models/riot/RiotId'

const { tags } = Config.constants

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

  const { riotId } = attendeeCreate.right

  const summoner = await theQuestService.getSummonerByRiotId(Config.constants.platform, riotId)

  if (summoner === undefined) {
    throw Error(`BadRequest - Summoner not found: ${RiotId.stringify('#')(riotId)}`)
  }

  const adminPb = await adminPocketBase

  const attendee = await adminPb.collection('attendees').create({
    ...attendeeCreate.right,
    user: user.id,
    tournament,
    puuid: summoner.puuid,
  })

  revalidateTag(tags.attendees.list)

  return attendee
}
