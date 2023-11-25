import { Duration, Effect, pipe } from 'effect'
import { cookies } from 'next/headers'

import type { TokenContent } from '../models/user/TokenContent'
import type { UserService } from '../services/UserService'
import type { EffecT } from '../utils/fp'
import { fpClass } from '../utils/fpClass'

const accountCookie = {
  name: 'userAccount',
  ttl: Duration.days(30),
}

type Auth = typeof Auth.T

const Auth = fpClass<{ readonly Auth: unique symbol }>()(
  (userService: UserService) => {
    /**
     * Returns `undefined` if cookie doesn't exist or if invalid token.
     * Clears cookie if invalid token.
     */
    const getToken: EffecT<Optional<TokenContent>> = pipe(
      Effect.sync(() => cookies()),
      Effect.flatMap(cookiesStore => {
        const cookie = cookiesStore.get(accountCookie.name)

        if (cookie === undefined) return Effect.succeed(undefined)

        return pipe(
          userService.verifyToken(cookie.value),
          Effect.orElse(() =>
            Effect.sync(() => {
              cookiesStore.delete(accountCookie.name)
              return undefined
            }),
          ),
        )
      }),
    )

    return { getToken }
  },
  { accountCookie },
)

export { Auth }
