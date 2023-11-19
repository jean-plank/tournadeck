import qs from 'querystring'

import type { ServerConfig } from '@/ServerConfig'
import { DiscordUserId } from '@/models/DiscordUserId'

export class DiscordHelper {
  constructor(private config: ServerConfig) {}

  // https://discord.com/developers/docs/topics/oauth2#authorization-code-grant
  apiOAuth2Authorize(state: string): string {
    return `https://discord.com/api/oauth2/authorize?${qs.stringify({
      client_id: DiscordUserId.unwrap(this.config.DISCORD_CLIENT_ID),
      redirect_uri: this.config.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify',
      state,
      prompt: 'none',
    })}`
  }
}
