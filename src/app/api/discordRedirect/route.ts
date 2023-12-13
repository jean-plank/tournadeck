import { Duration, Effect, pipe } from 'effect'
import * as D from 'io-ts/Decoder'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { type Context, contextLive } from '../../../lib/Context'
import { Auth } from '../../../lib/helpers/Auth'
import { DayJs } from '../../../lib/models/DayJs'
import { OAuth2Code } from '../../../lib/models/discord/OAuth2Code'
import { Token } from '../../../lib/models/user/Token'
import type { UserDiscordInfos } from '../../../lib/models/user/UserDiscordInfos'
import { DontLogError, EffecTUtils } from '../../../lib/utils/EffecTUtils'
import { EffecT, effectFromEither, recordFromEntries } from '../../../lib/utils/fp'
import { $filenameAndFunction } from '../../../lib/utils/macros'

type State = unknown

const codeDecoder = D.struct({
  code: OAuth2Code.codec,
  state: D.id<State>(),
})

export async function GET(request: NextRequest): Promise<Response> {
  // TODO: redirect shortcut if already valid auth

  const context = await contextLive

  const logger = context.Logger($filenameAndFunction!(GET))

  const query = recordFromEntries(request.nextUrl.searchParams.entries())

  const token: Optional<Token> = await pipe(
    codeDecoder.decode(query),
    effectFromEither,
    Effect.mapError(() => new DontLogError()),
    EffecT.flatMapFirst(({ state }) => validateState(state)),
    Effect.flatMap(({ code }) => exchangeCodeAndGetUsersMe(context, code)),
    Effect.flatMap(context.userService.registerOrLogin),
    EffecTUtils.orElseWithLog(logger, () => Effect.succeed(undefined)),
    Effect.runPromise,
  )

  if (token === undefined) return redirect('/notFound')

  const cookiesStore = cookies()

  cookiesStore.set(Auth.accountCookie.name, Token.codec.encode(token), {
    maxAge: Duration.toMillis(Auth.accountCookie.ttl),
    httpOnly: true,
    sameSite: 'strict',
  })

  return redirect('/')
}

// TODO: proper state
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateState(state: State): EffecT<void> {
  return Effect.succeed(undefined)
}

function exchangeCodeAndGetUsersMe(
  { discordService }: Context,
  code: OAuth2Code,
): EffecT<UserDiscordInfos> {
  return pipe(
    discordService.oauth2.token.post.authorizationCode(code),
    Effect.bindTo('oauth2'),
    Effect.bind('now', () => Effect.sync(DayJs.now)),
    Effect.bind('user', ({ oauth2 }) => discordService.users.me.get(oauth2.access_token)),
    Effect.map(({ oauth2, now, user }) => ({
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      accessToken: oauth2.access_token,
      expiresAt: pipe(now, DayJs.add(oauth2.expires_in)),
      refreshToken: oauth2.refresh_token,
    })),
  )
}
