'use server'

import { either } from 'fp-ts'
import * as D from 'io-ts/Decoder'
import { revalidateTag } from 'next/cache'
import type { Merge } from 'type-fest'

import { Config } from '../config/Config'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { AttendeeId } from '../models/pocketBase/tables/Attendee'
import type { Team } from '../models/pocketBase/tables/Team'
import { TeamId } from '../models/pocketBase/tables/Team'
import type { Tournament } from '../models/pocketBase/tables/Tournament'

const { tags } = Config.constants

type Payload = D.TypeOf<typeof payloadDecoder>

const payloadDecoder = D.struct({
  teamId: TeamId.codec,
  attendeeId: AttendeeId.codec,
  price: D.number,
})

export async function buyAttendee(payload: Payload): Promise<void> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  const validated = payloadDecoder.decode(payload)

  if (either.isLeft(validated)) {
    throw Error('BadRequest')
  }

  const { teamId, attendeeId, price } = validated.right

  const adminPb = await adminPocketBase()

  const team = await adminPb
    .collection('teams')
    // TODO: improve expand typings
    .getOne<Merge<Team, { expand: { tournament: Tournament } }>>(teamId, {
      expand: 'tournament' satisfies keyof Team,
    })

  const {
    expand: { tournament },
  } = team

  if (!Permissions.teams.buyAttendee(user.role, tournament)) {
    throw new AuthError('Forbidden')
  }

  const [teamMembers, attendee] = await Promise.all([
    adminPb.collection('attendees').getFullList({
      filter: adminPb.smartFilter<'attendees'>({
        tournament: tournament.id,
        team: team.id,
      }),
    }),
    adminPb.collection('attendees').getFirstListItem(
      adminPb.smartFilter<'attendees'>({
        id: attendeeId,
        tournament: tournament.id,
      }),
    ),
  ])

  if (teamMembers.some(a => a.id === attendee.id)) {
    throw Error('BadRequest: already in team')
  }

  const captain = teamMembers.find(a => a.isCaptain)

  await Promise.all([
    adminPb.collection('attendees').update(attendee.id, {
      team: team.id,
      price,
    }),
    captain !== undefined
      ? adminPb.collection('attendees').update(captain.id, { price: captain.price - price })
      : undefined,
  ])

  revalidateTag(tags.attendees)
}
