import { readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import { array } from '../../utils/fpTsUtils'
import type { TableName, Tables } from './Tables'
import type { PbInputWithId } from './pbModels'

export function smartFilter<A extends TableName>(
  filter: Partial<PbInputWithId<Tables[A]>>,
): string {
  return pipe(
    Object.entries(filter),
    readonlyArray.map(([key]) => {
      const k = String(key)
      return `${k} = {:${k}}`
    }),
    array.mkString(' && '),
  )
}
