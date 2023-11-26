import { Duration, Effect, pipe } from 'effect'
import { cookies } from 'next/headers'

import type { TokenContent } from '../models/user/TokenContent'
import type { UserService } from '../services/UserService'
import { brand } from '../utils/brand'
import type { EffecT } from '../utils/fp'

type Tag = { readonly Auth: unique symbol }

type Auth = ReturnType<typeof construct>

const accountCookie = {
  name: 'userAccount',
  ttl: Duration.days(30),
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function construct(userService: UserService) {
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

  return brand<Tag>()({
    getToken,
  })
}

const Auth = Object.assign(construct, { accountCookie })

export { Auth }
