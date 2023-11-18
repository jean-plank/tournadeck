import { Effect, pipe } from 'effect'

import { ServerConfig } from '@/ServerConfig'
import { DiscordUtils } from '@/app/utils/DiscordUtils'
import { EffecT } from '@/utils/fp'

export class Context {
  private constructor(public discordUtils: DiscordUtils) {}

  static load(config: ServerConfig): EffecT<never, never, Context> {
    // TODO: some effectful stuff, like pinging db, ensuring indexes or migrating db
    return Effect.succeed(new Context(new DiscordUtils(config)))
  }
}

export const contextLive: Promise<Context> = Effect.runPromise(
  pipe(ServerConfig.load, Effect.flatMap(Context.load)),
)
