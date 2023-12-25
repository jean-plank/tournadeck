import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { RedirectType } from 'next/navigation'

import { LogoutAndRedirect } from '../components/LogoutAndRedirect'
import { AuthError } from '../models/AuthError'
import { promiseEither } from '../utils/promiseUtils'

export const withRedirectOnAuthError =
  <A,>(fa: Promise<A>) =>
  async (f: (a: A) => JSX.Element | null): Promise<JSX.Element | null> =>
    pipe(
      await promiseEither(fa),
      either.fold(e => {
        if (e instanceof AuthError) return <LogoutAndRedirect type={RedirectType.replace} />
        throw e
      }, f),
    )
