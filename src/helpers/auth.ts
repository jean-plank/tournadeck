'use server'

import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { cookies } from 'next/headers'

import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { User } from '../models/pocketBase/tables/User'

const pbAuthCookie = 'pb_auth'

export type Auth = {
  user: User
}

export async function auth(): Promise<Optional<Auth>> {
  const cookie = cookies().get(pbAuthCookie)

  if (cookie === undefined) return undefined

  const maybeToken = await pipe(
    json.parse(cookie.value),
    either.flatMap(cookieValueDecoder.decode),
    either.getOrElseW(() => undefined),
  )

  if (maybeToken === undefined) return undefined

  const { token } = maybeToken

  const pb = MyPocketBase()

  pb.authStore.save(token)

  const response = await pb
    .collection('users')
    .authRefresh()
    .catch(() => undefined)

  if (response === undefined) return undefined

  return { user: response.record }
}

const cookieValueDecoder = D.struct({
  token: D.string,
})
