'use server'

import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { cookies } from 'next/headers'

import { config } from '../context/context'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { User } from '../models/pocketBase/tables/User'

const pbAuthCookie = 'pb_auth'

export type Auth = {
  user: User
}

export async function auth(): Promise<Optional<Auth>> {
  const cookie = cookies().get(pbAuthCookie)

  if (cookie === undefined) return undefined

  const maybeToken = pipe(
    json.parse(cookie.value),
    either.flatMap(cookieValueDecoder.decode),
    either.getOrElseW(() => undefined),
  )

  if (maybeToken === undefined) return undefined

  const { token } = maybeToken

  const pb = MyPocketBase(config.POCKET_BASE_URL)

  pb.authStore.save(token)

  const res = await pb
    .collection('users')
    .authRefresh({ cache: 'no-store' })
    .catch(() => undefined)

  if (res === undefined) return undefined

  return { user: res.record }
}

const cookieValueDecoder = D.struct({
  token: D.string,
})
