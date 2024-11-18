'use server'

import { either } from 'fp-ts'
import * as D from 'io-ts/Decoder'

import { config } from '../context/context'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import type { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { Attendee } from '../models/pocketBase/tables/Attendee'
import { TournamentId } from '../models/pocketBase/tables/Tournament'
import { nonEmptyStringDecoder } from '../utils/ioTsUtils'
import { pbFileUrl } from '../utils/pbFileUrl'

type Payload = D.TypeOf<typeof payloadDecoder>

const payloadDecoder = D.struct({
  id: TournamentId.codec,
  name: nonEmptyStringDecoder,
  withAttendees: D.boolean,
})

export async function cloneTournament(payload: Payload): Promise<TournamentId> {
  const validated = payloadDecoder.decode(payload)

  if (either.isLeft(validated)) {
    throw Error('BadRequest')
  }

  const { id: tournamentId, name: tournamentName, withAttendees } = validated.right

  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  if (!Permissions.tournaments.create(user.role)) {
    throw new AuthError('Forbidden')
  }

  const adminPb = await adminPocketBase()

  const oldTournament = await adminPb.collection('tournaments').getOne(tournamentId)

  const [oldTeams, oldMatchs, oldAttendees] = await Promise.all([
    adminPb.collection('teams').getFullList({
      filter: adminPb.smartFilter<'teams'>({ tournament: oldTournament.id }),
    }),

    adminPb.collection('matches').getFullList({
      filter: adminPb.smartFilter<'matches'>({ tournament: oldTournament.id }),
    }),

    withAttendees
      ? adminPb.collection('attendees').getFullList({
          filter: adminPb.smartFilter<'attendees'>({ tournament: oldTournament.id }),
        })
      : [],
  ])

  // ---

  const newTournament = await adminPb.collection('tournaments').create({
    phase: oldTournament.phase,
    name: tournamentName,
    start: oldTournament.start,
    end: oldTournament.end,
    teamsCount: oldTournament.teamsCount,
    isVisible: false,
    bannedChampions: oldTournament.bannedChampions,
  })

  await Promise.all([
    Promise.all(
      oldTeams.map(team =>
        adminPb.collection('teams').create({
          tournament: newTournament.id,
          name: team.name,
          tag: team.tag,
        }),
      ),
    ),

    Promise.all(
      oldMatchs.map(match =>
        adminPb.collection('matches').create({
          tournament: newTournament.id,
          round: match.round,
          bestOf: match.bestOf,
          team1: '',
          team2: '',
          winner: '',
          plannedOn: match.plannedOn,
          apiData: null,
        }),
      ),
    ),

    // oldAttendees is empty, if !withAttendees
    Promise.all(oldAttendees.map(createAttende(adminPb, newTournament.id))),
  ])

  return newTournament.id
}

const createAttende =
  (adminPb: MyPocketBase, newTournamentId: TournamentId) =>
  async (oldAttendee: Attendee): Promise<Attendee> => {
    const res = await fetch(
      pbFileUrl('attendees', oldAttendee.id, oldAttendee.avatar, config.POCKET_BASE_URL),
    )
    const avatar = await res.blob()

    return await adminPb.collection('attendees').create({
      user: oldAttendee.user,
      tournament: newTournamentId,
      puuid: oldAttendee.puuid,
      currentElo: oldAttendee.currentElo,
      comment: oldAttendee.comment,
      team: '',
      role: oldAttendee.role,
      championPool: oldAttendee.championPool,
      birthplace: oldAttendee.birthplace,
      avatar,
      isCaptain: oldAttendee.isCaptain,
      seed: oldAttendee.seed,
      avatarRating: oldAttendee.avatarRating,
      price: oldAttendee.price,
    })
  }
