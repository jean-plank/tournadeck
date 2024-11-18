import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { RedirectType, notFound } from 'next/navigation'
import React from 'react'

import { LogoutAndRedirect } from '../components/LogoutAndRedirect'
import { SetTournament } from '../contexts/TournamentContext'
import { AuthError } from '../models/AuthError'
import type { Tournament } from '../models/pocketBase/tables/Tournament'
import { promiseEither } from '../utils/promiseUtils'

/**
 * Logs out and redirects, if `AuthError`, else returns `notFound` if `undefined`, else pass.
 *
 * Sets `tournament` in `TournamentContext`.
 */
export const withRedirectTournament =
  <A extends { tournament: Optional<Tournament> }>(fa: Promise<Optional<A>>) =>
  async (f: (a: A) => React.ReactNode): Promise<React.ReactElement> =>
    pipe(
      await promiseEither(fa),
      either.foldW(
        e => {
          if (e instanceof AuthError) {
            return <LogoutAndRedirect type={RedirectType.replace} goBack={true} />
          }

          throw e
        },
        a => {
          if (a === undefined) return notFound()

          return (
            <>
              <SetTournament tournament={a.tournament} />
              {f(a)}
            </>
          )
        },
      ),
    )
