import { either, task } from 'fp-ts'
import type { Either } from 'fp-ts/Either'
import type { Task } from 'fp-ts/Task'

import type { DayjsDuration } from '../models/Dayjs'

export function sleep(duration: DayjsDuration): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration.asMilliseconds()))
}

export function promiseEither<A>(fa: Promise<A>): Promise<Either<unknown, A>> {
  return fa.then(either.right).catch(either.left)
}

export function promiseSequenceSeq<A>(
  promises: ReadonlyArray<Promise<A>>,
): Promise<ReadonlyArray<A>> {
  return task.sequenceSeqArray(
    promises.map(
      (p): Task<A> =>
        () =>
          p,
    ),
  )()
}
