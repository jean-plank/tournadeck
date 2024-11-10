import { either } from 'fp-ts'
import type { Either } from 'fp-ts/Either'

import type { DayjsDuration } from '../models/Dayjs'

export function sleep(duration: DayjsDuration): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration.asMilliseconds()))
}

export function promiseEither<A>(fa: Promise<A>): Promise<Either<unknown, A>> {
  return fa.then(either.right).catch(either.left)
}
