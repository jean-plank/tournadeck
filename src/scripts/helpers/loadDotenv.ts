import * as dotenv from 'dotenv'
import { either, option, readonlyArray } from 'fp-ts'
import type { Separated } from 'fp-ts/Separated'
import { identity, pipe } from 'fp-ts/function'
import path from 'path'

export function loadDotenv(): void {
  const { NODE_ENV } = process.env

  const { left, right } = loadDotenvs([
    `.env.${NODE_ENV}.local`,
    NODE_ENV !== 'test' ? '.env.local' : undefined,
    `.env.${NODE_ENV}`,
    '.env',
  ])

  console.debug('Not found:', left.join(', '))
  console.info('Loaded environments:', right.join(', '))

  function loadDotenvs(
    paths: NonEmptyArray<string | undefined>,
  ): Separated<ReadonlyArray<string>, ReadonlyArray<string>> {
    return pipe(
      paths,
      readonlyArray.filterMap(env => {
        if (env === undefined) return option.none

        const file = path.resolve(__dirname, '..', '..', '..', env)

        const result = dotenv.config({ path: file })

        return option.some(result.error !== undefined ? either.left(env) : either.right(env))
      }),
      readonlyArray.partitionMap(identity),
    )
  }
}
