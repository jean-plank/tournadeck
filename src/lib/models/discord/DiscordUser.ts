import { pipe } from 'effect'
import * as D from 'io-ts/Decoder'

import { DiscordUserId } from './DiscordUserId'

type DiscordUser = D.TypeOf<typeof decoder>

const decoder = pipe(
  D.struct({
    /**
     * the user's id
     */
    id: DiscordUserId.codec,
    /**
     * the user's username, not unique across the platform
     */
    username: D.string,
    /**
     * the user's Discord-tag
     */
    discriminator: D.string,
    /**
     * the user's display name, if it is set. For bots, this is the application name
     */
    global_name: D.nullable(D.string),
    /**
     * the user's avatar hash
     */
    avatar: D.nullable(D.string),
  }),
  D.intersect(
    D.partial({
      /**
       * whether the user belongs to an OAuth2 application
       */
      bot: D.boolean,
      /**
       * whether the user is an Official Discord System user (part of the urgent message system)
       */
      system: D.boolean,
      /**
       * whether the user has two factor enabled on their account
       */
      mfa_enabled: D.boolean,
      /**
       * the user's banner hash
       */
      banner: D.nullable(D.string),
      /**
       * the user's banner color encoded as an integer representation of hexadecimal color code
       */
      accent_color: D.nullable(D.number),
      /**
       * the user's chosen language option
       */
      locale: D.string,
      /**
       * whether the email on this account has been verified
       */
      verified: D.boolean,
      /**
       * the user's email
       */
      email: D.nullable(D.string),
      /**
       * the flags on a user's account
       */
      flags: D.number,
      /**
       * the type of Nitro subscription on a user's account
       */
      premium_type: D.number,
      /**
       * the public flags on a user's account
       */
      public_flags: D.number,
      /**
       * the user's avatar decoration hash
       */
      avatar_decoration: D.nullable(D.string),
    }),
  ),
)

const DiscordUser = { decoder }

export { DiscordUser }
