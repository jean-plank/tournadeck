'use server'

import { readonlyArray } from 'fp-ts'

import { Config } from '../../../config/Config'
import { adminPocketBase } from '../../../context/singletons/adminPocketBase'
import { Permissions } from '../../../helpers/Permissions'
import { auth } from '../../../helpers/auth'
import { withRedirectTournament } from '../../../helpers/withRedirectTournament'
import { AuthError } from '../../../models/AuthError'
import type { Tournament } from '../../../models/pocketBase/tables/Tournament'
import { GroupedTournaments } from './GroupedTournaments'

const { getFromPbCacheDuration, tags } = Config.constants

const TournamentsPage: React.FC = () =>
  withRedirectTournament(listTournaments())(({ tournaments }) => (
    <div className="flex flex-col items-center gap-10 p-4">
      {readonlyArray.isNonEmpty(tournaments) ? (
        <GroupedTournaments tournaments={tournaments} />
      ) : (
        <div className="text-goldenrod">Aucun tournoi n’a encore été créé.</div>
      )}
    </div>
  ))

export default TournamentsPage

type ListTournaments = {
  tournament: undefined
  tournaments: ReadonlyArray<Tournament>
}

export async function listTournaments(): Promise<ListTournaments> {
  const maybeAuth = await auth()

  if (maybeAuth === undefined) {
    throw new AuthError('Unauthorized')
  }

  const { user } = maybeAuth

  if (!Permissions.tournaments.list(user.role)) {
    return { tournament: undefined, tournaments: [] }
  }

  const adminPb = await adminPocketBase()

  const tournaments = await adminPb.collection('tournaments').getFullList({
    ...(user.role === 'organiser'
      ? {}
      : { filter: adminPb.smartFilter<'tournaments'>({ isVisible: true }) }),
    next: { revalidate: getFromPbCacheDuration, tags: [tags.tournaments] },
  })

  return { tournament: undefined, tournaments }
}
