import 'server-cli-only'

import { either, json } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { cookies } from 'next/headers'

import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { User } from '../models/pocketBase/tables/User'

const pbAuthCookie = 'pb_auth'

type Auth = {
  user: User
}

export async function auth(): Promise<Auth> {
  const cookie = cookies().get(pbAuthCookie)

  if (cookie === undefined) {
    throw Error('Missing cookie')
  }

  const { token } = pipe(
    json.parse(cookie.value),
    either.chainW(cookieValueDecoder.decode),
    either.getOrElseW(() => {
      throw Error('Invalid cookie value')
    }),
  )

  const pb = MyPocketBase()

  pb.authStore.save(token)

  const res = await pb.collection('users').authRefresh()

  return { user: res.record }
}

const cookieValueDecoder = D.struct({
  token: D.string,
})
