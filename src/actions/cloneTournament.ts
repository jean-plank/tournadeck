'use server'

import { config } from '../context/context'
import { adminPocketBase } from '../context/singletons/adminPocketBase'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import { AuthError } from '../models/AuthError'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import { Attendee } from '../models/pocketBase/tables/Attendee'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import { pbFileUrl } from '../utils/pbFileUrl'

export async function cloneTournament(
  tournamentId: TournamentId,
  withAttendees: boolean,
): Promise<TournamentId> {
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
    name: `${oldTournament.name} (1)`, // TODO: proper increment
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
      avatar: avatar,
      isCaptain: oldAttendee.isCaptain,
      seed: oldAttendee.seed,
      avatarRating: oldAttendee.avatarRating,
      price: oldAttendee.price,
    })
  }
