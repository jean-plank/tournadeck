import { Effect, pipe } from 'effect'
import * as D from 'io-ts/Decoder'

import type { ServerConfig } from '../ServerConfig'
import type { HttpClient } from '../helpers/HttpClient'
import { AccessToken } from '../models/discord/AccessToken'
import { DiscordConnection } from '../models/discord/DiscordConnection'
import { DiscordUser } from '../models/discord/DiscordUser'
import { OAuth2AccessTokenResult } from '../models/discord/OAuth2AccessTokenResult'
import { OAuth2AuthorizationCodePayload } from '../models/discord/OAuth2AuthorizationCodePayload'
import type { OAuth2Code } from '../models/discord/OAuth2Code'
import { OAuth2RefreshTokenPayload } from '../models/discord/OAuth2RefreshTokenPayload'
import { OAuth2SearchParams } from '../models/discord/OAuth2SearchParams'
import type { RefreshToken } from '../models/discord/RefreshToken'
import type { EffecT } from '../utils/fp'
import { $decoderWithName, $withName } from '../utils/macros'

const apiEndpoint = 'https://discord.com/api'

const DiscordConnectionArray = D.array(DiscordConnection.decoder)

export class DiscordService {
  oauth2: {
    token: {
      post: {
        authorizationCode: (code: OAuth2Code) => EffecT<OAuth2AccessTokenResult>
        refreshToken: (refreshToken: RefreshToken) => EffecT<OAuth2AccessTokenResult>
      }
    }
  }

  users: {
    me: {
      get: (token: AccessToken) => EffecT<DiscordUser>
      connections: {
        get: (token: AccessToken) => EffecT<ReadonlyArray<DiscordConnection>>
      }
    }
  }

  constructor(
    private config: ServerConfig,
    httpClient: HttpClient,
  ) {
    this.oauth2 = {
      token: {
        post: {
          authorizationCode: code =>
            pipe(
              httpClient
                .post(`${apiEndpoint}/oauth2/token`, {
                  form: [
                    OAuth2AuthorizationCodePayload.encoder,
                    {
                      client_id: config.DISCORD_CLIENT_ID,
                      client_secret: config.DISCORD_CLIENT_SECRET,
                      grant_type: 'authorization_code',
                      code,
                      redirect_uri: config.DISCORD_REDIRECT_URI,
                    },
                  ],
                })
                .json($decoderWithName!(OAuth2AccessTokenResult)),
              Effect.map(r => r.value),
            ),

          refreshToken: refreshToken =>
            pipe(
              httpClient
                .post(`${apiEndpoint}/oauth2/token`, {
                  form: [
                    OAuth2RefreshTokenPayload.encoder,
                    {
                      client_id: config.DISCORD_CLIENT_ID,
                      client_secret: config.DISCORD_CLIENT_SECRET,
                      grant_type: 'refresh_token',
                      refresh_token: refreshToken,
                    },
                  ],
                })
                .json($decoderWithName!(OAuth2AccessTokenResult)),
              Effect.map(r => r.value),
            ),
        },
      },
    }

    this.users = {
      me: {
        get: token =>
          pipe(
            httpClient
              .get(`${apiEndpoint}/users/@me`, {
                headers: { authorization: authorizationHeader(token) },
              })
              .json($decoderWithName!(DiscordUser)),
            Effect.map(r => r.value),
          ),

        connections: {
          get: token =>
            pipe(
              httpClient
                .get(`${apiEndpoint}/users/@me/connections`, {
                  headers: { authorization: authorizationHeader(token) },
                })
                .json($withName!(DiscordConnectionArray)),
              Effect.map(r => r.value),
            ),
        },
      },
    }
  }

  /**
   * @see https://discord.com/developers/docs/topics/oauth2#authorization-code-grant
   * @returns oauth2 Discord url
   */
  apiOAuth2Authorize(state: string): string {
    const params: OAuth2SearchParams = {
      client_id: this.config.DISCORD_CLIENT_ID,
      redirect_uri: this.config.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: ['identify'],
      state,
      prompt: 'none',
    }

    const search = new URLSearchParams(OAuth2SearchParams.encoder.encode(params)).toString()

    return `https://discord.com/api/oauth2/authorize?${search}`
  }
}

function authorizationHeader(
  token: AccessToken,
): `${OAuth2AccessTokenResult['token_type']} ${string}` {
  return `Bearer ${AccessToken.unwrap(token)}`
}
