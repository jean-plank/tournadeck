'use server'

import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { cookies } from 'next/headers'
import { cache } from 'react'

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

  const response = await cachedAuth(token)

  if (response === undefined) return undefined

  return { user: response.record }
}

const cachedAuth = cache(async (token: string) => {
  const pb = MyPocketBase()

  pb.authStore.save(token)

  return await pb
    .collection('users')
    .authRefresh({ cache: 'no-store' })
    .catch(() => undefined)
})

const cookieValueDecoder = D.struct({
  token: D.string,
})
