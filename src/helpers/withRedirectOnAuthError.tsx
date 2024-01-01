import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { RedirectType } from 'next/navigation'

import { LogoutAndRedirect } from '../components/LogoutAndRedirect'
import { AuthError } from '../models/AuthError'
import { promiseEither } from '../utils/promiseUtils'

export const withRedirectOnAuthError =
  <A,>(fa: Promise<A>) =>
  async <B,>(f: (a: A) => B): Promise<B | JSX.Element> =>
    pipe(
      await promiseEither(fa),
      either.foldW(e => {
        if (e instanceof AuthError)
          return <LogoutAndRedirect type={RedirectType.replace} goBack={true} />
        throw e
      }, f),
    )
